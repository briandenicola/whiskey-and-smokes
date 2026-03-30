using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SipPuff.Api.Models;
using SipPuff.Api.Services;
using System.Security.Claims;

namespace SipPuff.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IAuthService _authService;
    private const string ContainerName = "users";

    public UsersController(ICosmosDbService cosmosDb, IAuthService authService)
    {
        _cosmosDb = cosmosDb;
        _authService = authService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet("me")]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        var userId = GetUserId();
        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null) return NotFound();
        return Ok(user.Sanitized());
    }

    [HttpPut("me")]
    public async Task<ActionResult<User>> UpdateCurrentUser([FromBody] UpdateUserRequest request)
    {
        var userId = GetUserId();
        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null) return NotFound();

        if (request.DisplayName != null) user.DisplayName = request.DisplayName;
        if (request.Preferences != null) user.Preferences = request.Preferences;
        user.UpdatedAt = DateTime.UtcNow;

        user = await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);
        return Ok(user.Sanitized());
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
            return BadRequest(new { message = "New password must be at least 8 characters" });

        var userId = GetUserId();
        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null) return NotFound();

        if (!_authService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
            return BadRequest(new { message = "Current password is incorrect" });

        user.PasswordHash = _authService.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        return Ok(new { message = "Password changed successfully" });
    }
}
