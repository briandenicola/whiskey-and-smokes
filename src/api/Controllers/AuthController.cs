using Microsoft.AspNetCore.Mvc;
using SipPuff.Api.Models;
using SipPuff.Api.Services;

namespace SipPuff.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IAuthService _authService;
    private const string ContainerName = "users";

    public AuthController(ICosmosDbService cosmosDb, IAuthService authService)
    {
        _cosmosDb = cosmosDb;
        _authService = authService;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register([FromBody] RegisterRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required" });

        if (request.Password.Length < 8)
            return BadRequest(new { message = "Password must be at least 8 characters" });

        var existing = await _authService.FindByEmailAsync(request.Email.ToLowerInvariant());
        if (existing != null)
            return Conflict(new { message = "An account with this email already exists" });

        var user = new User
        {
            DisplayName = request.DisplayName.Trim(),
            Email = request.Email.ToLowerInvariant().Trim(),
            PasswordHash = _authService.HashPassword(request.Password),
            Role = "user"
        };

        // First user becomes admin
        var existingUsers = await _cosmosDb.QueryCrossPartitionAsync<User>(ContainerName, "SELECT TOP 1 c.id FROM c", maxItems: 1);
        if (existingUsers.Count == 0)
        {
            user.Role = "admin";
        }

        user = await _cosmosDb.CreateAsync(ContainerName, user, user.PartitionKey);
        var response = _authService.GenerateToken(user);
        response.User = user.Sanitized();
        return Ok(response);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login([FromBody] LoginRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Email) || string.IsNullOrWhiteSpace(request.Password))
            return BadRequest(new { message = "Email and password are required" });

        var user = await _authService.FindByEmailAsync(request.Email.ToLowerInvariant());
        if (user == null || !_authService.VerifyPassword(request.Password, user.PasswordHash))
            return Unauthorized(new { message = "Invalid email or password" });

        if (user.IsDisabled)
            return Unauthorized(new { message = "Account is disabled" });

        var response = _authService.GenerateToken(user);
        response.User = user.Sanitized();
        return Ok(response);
    }
}
