using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SipPuff.Api.Models;
using SipPuff.Api.Services;

namespace SipPuff.Api.Controllers;

[ApiController]
[Route("api/admin")]
[Authorize(Policy = "AdminOnly")]
public class AdminController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private const string ContainerName = "users";

    public AdminController(ICosmosDbService cosmosDb)
    {
        _cosmosDb = cosmosDb;
    }

    [HttpGet("users")]
    public async Task<ActionResult<List<User>>> ListUsers()
    {
        var users = await _cosmosDb.QueryCrossPartitionAsync<User>(
            ContainerName,
            "SELECT * FROM c ORDER BY c.createdAt DESC");
        return Ok(users.Select(u => u.Sanitized()).ToList());
    }

    [HttpPut("users/{userId}/role")]
    public async Task<ActionResult<User>> UpdateUserRole(string userId, [FromBody] UpdateUserRoleRequest request)
    {
        if (request.Role != "user" && request.Role != "admin")
            return BadRequest("Role must be 'user' or 'admin'");

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null) return NotFound();

        user.Role = request.Role;
        user.UpdatedAt = DateTime.UtcNow;
        user = await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        return Ok(user.Sanitized());
    }
}
