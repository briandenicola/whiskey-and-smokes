using System.Diagnostics;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using WhiskeyAndSmokes.Api;
using WhiskeyAndSmokes.Api.Models;

namespace WhiskeyAndSmokes.Api.Services;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    AuthResponse GenerateToken(User user);
    Task<AuthResponse> GenerateTokenWithRefreshAsync(User user);
    Task<AuthResponse?> RefreshTokensAsync(string expiredAccessToken, string rawRefreshToken);
    Task RevokeAllRefreshTokensAsync(string userId);
    Task RevokeRefreshTokenAsync(string userId, string rawRefreshToken);
    ClaimsPrincipal? GetPrincipalFromExpiredToken(string token);
    Task<User?> FindByEmailAsync(string email);
    Task<User?> FindByEntraObjectIdAsync(string objectId);
}

public class AuthService : IAuthService
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly JwtOptions _jwtOptions;
    private readonly ILogger<AuthService> _logger;
    private const string ContainerName = "users";
    private const int MaxRefreshTokensPerUser = 10;

    public AuthService(ICosmosDbService cosmosDb, IOptions<JwtOptions> jwtOptions, ILogger<AuthService> logger)
    {
        _cosmosDb = cosmosDb;
        _jwtOptions = jwtOptions.Value;
        _logger = logger;
    }

    public string HashPassword(string password)
    {
        using var activity = Diagnostics.Auth.StartActivity("HashPassword");
        _logger.LogDebug("Hashing password with workFactor=12");
        var sw = Stopwatch.StartNew();
        var result = BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);
        sw.Stop();
        _logger.LogDebug("Password hashing completed in {ElapsedMs}ms", sw.ElapsedMilliseconds);
        return result;
    }

    public bool VerifyPassword(string password, string hash)
    {
        using var activity = Diagnostics.Auth.StartActivity("VerifyPassword");
        _logger.LogDebug("Verifying password hash");
        var sw = Stopwatch.StartNew();
        var result = BCrypt.Net.BCrypt.Verify(password, hash);
        sw.Stop();
        _logger.LogDebug("Password verification completed in {ElapsedMs}ms, result={IsValid}", sw.ElapsedMilliseconds, result);
        return result;
    }

    public AuthResponse GenerateToken(User user)
    {
        using var activity = Diagnostics.Auth.StartActivity("GenerateToken");
        activity?.SetTag("auth.user_id", user.Id);
        activity?.SetTag("auth.role", user.Role);

        _logger.LogInformation("Generating JWT token for user {UserId} (email={Email}, role={Role})",
            user.Id, user.Email, user.Role);

        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtOptions.Secret.Length > 0
                ? _jwtOptions.Secret
                : throw new InvalidOperationException("JWT secret not configured")));

        var expiresAt = DateTime.UtcNow.AddMinutes(_jwtOptions.AccessTokenExpirationMinutes);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var token = new JwtSecurityToken(
            issuer: _jwtOptions.Issuer,
            audience: _jwtOptions.Audience,
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        _logger.LogInformation(
            "JWT token generated for user {UserId}: expiresAt={ExpiresAt}, expirationMinutes={ExpirationMinutes}, issuer={Issuer}",
            user.Id, expiresAt, _jwtOptions.AccessTokenExpirationMinutes, _jwtOptions.Issuer);

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
            User = user
        };
    }

    public async Task<AuthResponse> GenerateTokenWithRefreshAsync(User user)
    {
        using var activity = Diagnostics.Auth.StartActivity("GenerateTokenWithRefresh");
        activity?.SetTag("auth.user_id", user.Id);

        var response = GenerateToken(user);

        var rawRefreshToken = GenerateRawRefreshToken();
        var tokenHash = HashRefreshToken(rawRefreshToken);

        var refreshToken = new Models.RefreshToken
        {
            TokenHash = tokenHash,
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays),
        };

        // Prune oldest tokens if over limit
        user.RefreshTokens.RemoveAll(t => t.ExpiresAt <= DateTime.UtcNow);
        if (user.RefreshTokens.Count >= MaxRefreshTokensPerUser)
        {
            var oldest = user.RefreshTokens.OrderBy(t => t.CreatedAt).First();
            user.RefreshTokens.Remove(oldest);
        }

        user.RefreshTokens.Add(refreshToken);
        user.UpdatedAt = DateTime.UtcNow;
        await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        response.RefreshToken = rawRefreshToken;

        _logger.LogInformation("Refresh token generated for user {UserId}, active tokens: {Count}",
            user.Id, user.RefreshTokens.Count);

        return response;
    }

    public async Task<AuthResponse?> RefreshTokensAsync(string expiredAccessToken, string rawRefreshToken)
    {
        using var activity = Diagnostics.Auth.StartActivity("RefreshTokens");

        var principal = GetPrincipalFromExpiredToken(expiredAccessToken);
        if (principal == null)
        {
            _logger.LogWarning("Refresh failed: could not extract claims from expired token");
            return null;
        }

        var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(userId))
        {
            _logger.LogWarning("Refresh failed: no user ID in expired token");
            return null;
        }

        activity?.SetTag("auth.user_id", userId);

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null || user.IsDisabled)
        {
            _logger.LogWarning("Refresh failed: user {UserId} not found or disabled", userId);
            return null;
        }

        var incomingHash = HashRefreshToken(rawRefreshToken);
        var storedToken = user.RefreshTokens.FirstOrDefault(t => t.TokenHash == incomingHash);

        if (storedToken == null)
        {
            _logger.LogWarning("Refresh failed for user {UserId}: token not found (possible reuse attack)", userId);
            return null;
        }

        if (storedToken.ExpiresAt <= DateTime.UtcNow)
        {
            _logger.LogWarning("Refresh failed for user {UserId}: refresh token expired", userId);
            user.RefreshTokens.Remove(storedToken);
            await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);
            return null;
        }

        // Rotate: remove old token, issue new pair
        user.RefreshTokens.Remove(storedToken);

        var response = GenerateToken(user);
        response.User = user.Sanitized();

        var newRawRefreshToken = GenerateRawRefreshToken();
        var newRefreshToken = new Models.RefreshToken
        {
            TokenHash = HashRefreshToken(newRawRefreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtOptions.RefreshTokenExpirationDays),
        };

        user.RefreshTokens.Add(newRefreshToken);
        user.UpdatedAt = DateTime.UtcNow;
        await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        response.RefreshToken = newRawRefreshToken;

        _logger.LogInformation("Tokens refreshed for user {UserId}", userId);
        return response;
    }

    public async Task RevokeAllRefreshTokensAsync(string userId)
    {
        using var activity = Diagnostics.Auth.StartActivity("RevokeAllRefreshTokens");
        activity?.SetTag("auth.user_id", userId);

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null) return;

        var count = user.RefreshTokens.Count;
        user.RefreshTokens.Clear();
        user.UpdatedAt = DateTime.UtcNow;
        await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        _logger.LogInformation("Revoked {Count} refresh tokens for user {UserId}", count, userId);
    }

    public async Task RevokeRefreshTokenAsync(string userId, string rawRefreshToken)
    {
        using var activity = Diagnostics.Auth.StartActivity("RevokeRefreshToken");
        activity?.SetTag("auth.user_id", userId);

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null) return;

        var hash = HashRefreshToken(rawRefreshToken);
        var removed = user.RefreshTokens.RemoveAll(t => t.TokenHash == hash);

        if (removed > 0)
        {
            user.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);
            _logger.LogInformation("Revoked refresh token for user {UserId}", userId);
        }
    }

    public ClaimsPrincipal? GetPrincipalFromExpiredToken(string token)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_jwtOptions.Secret.Length > 0
                ? _jwtOptions.Secret
                : throw new InvalidOperationException("JWT secret not configured")));

        var validationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = _jwtOptions.Issuer,
            ValidateAudience = true,
            ValidAudience = _jwtOptions.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateLifetime = false, // Allow expired tokens
        };

        try
        {
            var principal = new JwtSecurityTokenHandler().ValidateToken(token, validationParameters, out var securityToken);
            if (securityToken is not JwtSecurityToken jwtToken ||
                !jwtToken.Header.Alg.Equals(SecurityAlgorithms.HmacSha256, StringComparison.InvariantCultureIgnoreCase))
            {
                return null;
            }
            return principal;
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to validate expired token");
            return null;
        }
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        using var activity = Diagnostics.Auth.StartActivity("FindByEmail");
        activity?.SetTag("auth.email_lookup", email);

        _logger.LogDebug("Looking up user by email {Email}", email);

        var users = await _cosmosDb.QueryCrossPartitionAsync<User>(
            ContainerName,
            "SELECT * FROM c WHERE c.email = @email",
            new Dictionary<string, object> { ["@email"] = email },
            maxItems: 1);

        var user = users.FirstOrDefault();
        if (user != null)
        {
            _logger.LogInformation("User found by email {Email}: userId={UserId}, role={Role}", email, user.Id, user.Role);
        }
        else
        {
            _logger.LogInformation("No user found for email {Email}", email);
        }

        return user;
    }

    public async Task<User?> FindByEntraObjectIdAsync(string objectId)
    {
        using var activity = Diagnostics.Auth.StartActivity("FindByEntraObjectId");
        _logger.LogDebug("Looking up user by Entra Object ID {ObjectId}", objectId);

        var users = await _cosmosDb.QueryCrossPartitionAsync<User>(
            ContainerName,
            "SELECT * FROM c WHERE c.entraObjectId = @oid",
            new Dictionary<string, object> { ["@oid"] = objectId },
            maxItems: 1);

        return users.FirstOrDefault();
    }

    private static string GenerateRawRefreshToken()
    {
        var randomBytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    private static string HashRefreshToken(string rawToken)
    {
        var bytes = Encoding.UTF8.GetBytes(rawToken);
        var hash = SHA256.HashData(bytes);
        return Convert.ToBase64String(hash);
    }
}
