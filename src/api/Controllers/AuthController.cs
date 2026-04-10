using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Protocols;
using Microsoft.IdentityModel.Protocols.OpenIdConnect;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using WhiskeyAndSmokes.Api;
using WhiskeyAndSmokes.Api.Models;
using WhiskeyAndSmokes.Api.Services;

namespace WhiskeyAndSmokes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class AuthController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IAuthService _authService;
    private readonly EntraIdOptions _entraOptions;
    private readonly ILogger<AuthController> _logger;
    private const string ContainerName = "users";

    public AuthController(
        ICosmosDbService cosmosDb,
        IAuthService authService,
        IOptions<EntraIdOptions> entraOptions,
        ILogger<AuthController> logger)
    {
        _cosmosDb = cosmosDb;
        _authService = authService;
        _entraOptions = entraOptions.Value;
        _logger = logger;
    }

    [AllowAnonymous]
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        using var activity = Diagnostics.Auth.StartActivity("AuthRegister");
        activity?.SetTag("auth.method", "register");
        activity?.SetTag("user.email", request.Email);
        _logger.LogDebug("Registration attempt for email {Email}", request.Email);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            _logger.LogWarning("Registration failed: email or password is empty");
            return BadRequest(new { message = "Email and password are required" });
        }

        if (request.Password.Length < 8)
        {
            _logger.LogWarning("Registration failed for {Email}: password too short", request.Email);
            return BadRequest(new { message = "Password must be at least 8 characters" });
        }

        var existing = await _authService.FindByEmailAsync(request.Email.ToLowerInvariant());
        if (existing != null)
        {
            _logger.LogWarning("Registration failed for {Email}: account already exists", request.Email);
            return Conflict(new { message = "An account with this email already exists" });
        }

        var user = new User
        {
            DisplayName = request.DisplayName?.Trim() ?? request.Email.Split('@')[0],
            Email = request.Email.ToLowerInvariant().Trim(),
            PasswordHash = _authService.HashPassword(request.Password),
            Role = "user"
        };

        // First user becomes admin
        var existingUsers = await _cosmosDb.QueryCrossPartitionAsync<User>(ContainerName, "SELECT TOP 1 c.id FROM c", maxItems: 1);
        var isFirstUser = existingUsers.Count == 0;
        activity?.SetTag("auth.is_first_user", isFirstUser);
        if (isFirstUser)
        {
            user.Role = "admin";
            _logger.LogInformation("First user registration — {Email} will be assigned admin role", request.Email);
        }

        user = await _cosmosDb.CreateAsync(ContainerName, user, user.PartitionKey);
        var response = await _authService.GenerateTokenWithRefreshAsync(user);
        response.User = user.Sanitized();

        _logger.LogInformation("User registered successfully: {UserId} ({Email}), role={Role}",
            user.Id, user.Email, user.Role);
        return Ok(response);
    }

    [AllowAnonymous]
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        using var activity = Diagnostics.Auth.StartActivity("AuthLogin");
        activity?.SetTag("auth.method", "login");
        activity?.SetTag("user.email", request.Email);
        _logger.LogDebug("Login attempt for email {Email}", request.Email);

        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
        {
            _logger.LogWarning("Login failed: email or password is empty");
            return BadRequest(new { message = "Email and password are required" });
        }

        var user = await _authService.FindByEmailAsync(request.Email.ToLowerInvariant());
        if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
        {
            _logger.LogWarning("Login failed for {Email}: invalid credentials", request.Email);
            return Unauthorized(new { message = "Invalid email or password" });
        }

        if (user.IsDisabled)
        {
            _logger.LogWarning("Login failed for {Email}: account is disabled", request.Email);
            return Unauthorized(new { message = "Account is disabled" });
        }

        var response = await _authService.GenerateTokenWithRefreshAsync(user);
        response.User = user.Sanitized();

        _logger.LogInformation("User logged in successfully: {UserId} ({Email})", user.Id, user.Email);
        return Ok(response);
    }

    /// <summary>
    /// Exchange an Entra ID access token for a local JWT. Auto-provisions user on first sign-in.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("entra")]
    public async Task<ActionResult<AuthResponse>> EntraLogin([FromBody] EntraTokenRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        using var activity = Diagnostics.Auth.StartActivity("AuthEntraLogin");
        activity?.SetTag("auth.method", "entra");

        if (!_entraOptions.IsConfigured)
        {
            _logger.LogWarning("Entra login attempted but Entra ID is not configured");
            return BadRequest(new { message = "Entra ID authentication is not configured" });
        }

        if (string.IsNullOrWhiteSpace(request.AccessToken))
            return BadRequest(new { message = "Access token is required" });

        // Validate the Entra ID token with proper signature verification
        JwtSecurityToken jwt;
        try
        {
            var authority = $"{_entraOptions.Instance}{_entraOptions.TenantId}/v2.0";
            var configManager = new ConfigurationManager<OpenIdConnectConfiguration>(
                $"{authority}/.well-known/openid-configuration",
                new OpenIdConnectConfigurationRetriever(),
                new HttpDocumentRetriever());

            var openIdConfig = await configManager.GetConfigurationAsync(
                new CancellationTokenSource(TimeSpan.FromSeconds(30)).Token);

            var validationParams = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidIssuer = authority,
                ValidateAudience = true,
                ValidAudience = !string.IsNullOrEmpty(_entraOptions.Audience)
                    ? _entraOptions.Audience
                    : _entraOptions.ClientId,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                IssuerSigningKeys = openIdConfig.SigningKeys,
                ClockSkew = TimeSpan.FromMinutes(5)
            };

            var handler = new JwtSecurityTokenHandler();
            handler.ValidateToken(request.AccessToken, validationParams, out var validatedToken);
            jwt = (JwtSecurityToken)validatedToken;
        }
        catch (SecurityTokenException ex)
        {
            _logger.LogWarning(ex, "Entra token validation failed");
            return Unauthorized(new { message = "Invalid or expired token" });
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate Entra token");
            return BadRequest(new { message = "Invalid token format" });
        }

        var objectId = jwt.Claims.FirstOrDefault(c => c.Type == "oid")?.Value;
        var email = jwt.Claims.FirstOrDefault(c => c.Type == "preferred_username")?.Value
                    ?? jwt.Claims.FirstOrDefault(c => c.Type == "email")?.Value
                    ?? jwt.Claims.FirstOrDefault(c => c.Type == "upn")?.Value;
        var displayName = jwt.Claims.FirstOrDefault(c => c.Type == "name")?.Value;

        if (string.IsNullOrEmpty(objectId))
        {
            _logger.LogWarning("Entra token missing oid claim");
            return BadRequest(new { message = "Token missing required claims" });
        }

        activity?.SetTag("user.email", email ?? "unknown");

        // Look up existing user by Entra Object ID
        var user = await _authService.FindByEntraObjectIdAsync(objectId);

        if (user == null && !string.IsNullOrEmpty(email))
        {
            // Check if a local account exists with the same email — link them
            user = await _authService.FindByEmailAsync(email.ToLowerInvariant());
            if (user != null && user.AuthProvider == "local")
            {
                _logger.LogInformation("Linking existing local account {UserId} to Entra Object ID {ObjectId}",
                    user.Id, objectId);
                user.EntraObjectId = objectId;
                user.AuthProvider = "linked";
                user.UpdatedAt = DateTime.UtcNow;
                await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);
            }
        }

        if (user == null)
        {
            // Auto-provision new user
            user = new User
            {
                DisplayName = displayName?.Trim() ?? email?.Split('@')[0] ?? "User",
                Email = email?.ToLowerInvariant().Trim() ?? $"{objectId}@entra",
                PasswordHash = "",
                Role = "user",
                AuthProvider = "entra",
                EntraObjectId = objectId
            };

            user = await _cosmosDb.CreateAsync(ContainerName, user, user.PartitionKey);
            _logger.LogInformation("Auto-provisioned Entra user: {UserId} ({Email}), OID={ObjectId}",
                user.Id, user.Email, objectId);
        }

        if (user.IsDisabled)
        {
            _logger.LogWarning("Entra login failed for {Email}: account is disabled", user.Email);
            return Unauthorized(new { message = "Account is disabled" });
        }

        // Update display name if changed in Entra
        if (!string.IsNullOrEmpty(displayName) && displayName != user.DisplayName)
        {
            user.DisplayName = displayName;
            user.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);
        }

        var response = await _authService.GenerateTokenWithRefreshAsync(user);
        response.User = user.Sanitized();

        _logger.LogInformation("Entra user logged in: {UserId} ({Email})", user.Id, user.Email);
        return Ok(response);
    }

    /// <summary>
    /// Returns Entra ID configuration for the frontend MSAL setup. No auth required.
    /// </summary>
    [AllowAnonymous]
    [HttpGet("entra/config")]
    public ActionResult<EntraConfigResponse> GetEntraConfig()
    {
        if (!_entraOptions.IsConfigured)
            return NotFound(new { message = "Entra ID authentication is not configured" });

        return Ok(new EntraConfigResponse
        {
            ClientId = _entraOptions.ClientId,
            Authority = $"{_entraOptions.Instance}{_entraOptions.TenantId}",
            Scopes = [$"api://{_entraOptions.ClientId}/access_as_user"]
        });
    }

    /// <summary>
    /// Exchange an expired access token + valid refresh token for a new token pair.
    /// </summary>
    [AllowAnonymous]
    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh([FromBody] RefreshRequest request)
    {
        if (!ModelState.IsValid) return BadRequest(ModelState);

        using var activity = Diagnostics.Auth.StartActivity("AuthRefresh");
        _logger.LogDebug("Token refresh attempt");

        var response = await _authService.RefreshTokensAsync(request.AccessToken, request.RefreshToken);
        if (response == null)
        {
            _logger.LogWarning("Token refresh failed");
            return Unauthorized(new { message = "Invalid or expired refresh token" });
        }

        _logger.LogInformation("Token refreshed for user {UserId}", response.User.Id);
        return Ok(response);
    }

    /// <summary>
    /// Revoke the current refresh token (logout from this device).
    /// </summary>
    [HttpPost("logout")]
    public async Task<IActionResult> Logout([FromBody] LogoutRequest request)
    {
        using var activity = Diagnostics.Auth.StartActivity("AuthLogout");
        var userId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId)) return Unauthorized();

        activity?.SetTag("auth.user_id", userId);

        if (!string.IsNullOrEmpty(request.RefreshToken))
        {
            await _authService.RevokeRefreshTokenAsync(userId, request.RefreshToken);
        }

        _logger.LogInformation("User {UserId} logged out", userId);
        return Ok(new { message = "Logged out successfully" });
    }
}
