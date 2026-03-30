using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SipPuff.Api.Models;
using SipPuff.Api.Services;
using System.Security.Claims;

namespace SipPuff.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ItemsController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private const string ContainerName = "items";

    public ItemsController(ICosmosDbService cosmosDb)
    {
        _cosmosDb = cosmosDb;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet]
    public async Task<ActionResult<PagedResponse<Item>>> ListItems(
        [FromQuery] string? type,
        [FromQuery] string? continuationToken)
    {
        var userId = GetUserId();
        System.Linq.Expressions.Expression<Func<Item, bool>>? predicate = null;

        if (!string.IsNullOrEmpty(type))
            predicate = i => i.Type == type;

        var (items, nextToken) = await _cosmosDb.QueryAsync(ContainerName, userId, continuationToken, predicate: predicate);

        return Ok(new PagedResponse<Item>
        {
            Items = items,
            ContinuationToken = nextToken,
            HasMore = nextToken != null
        });
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<Item>> GetItem(string id)
    {
        var userId = GetUserId();
        var item = await _cosmosDb.GetAsync<Item>(ContainerName, id, userId);
        if (item == null) return NotFound();
        return Ok(item);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<Item>> UpdateItem(string id, [FromBody] UpdateItemRequest request)
    {
        var userId = GetUserId();
        var item = await _cosmosDb.GetAsync<Item>(ContainerName, id, userId);
        if (item == null) return NotFound();

        if (request.Name != null) item.Name = request.Name;
        if (request.Brand != null) item.Brand = request.Brand;
        if (request.Category != null) item.Category = request.Category;
        if (request.UserRating.HasValue) item.UserRating = request.UserRating;
        if (request.UserNotes != null) item.UserNotes = request.UserNotes;
        if (request.Tags != null) item.Tags = request.Tags;
        if (request.Status != null) item.Status = request.Status;
        item.UpdatedAt = DateTime.UtcNow;

        item = await _cosmosDb.UpsertAsync(ContainerName, item, item.PartitionKey);
        return Ok(item);
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> DeleteItem(string id)
    {
        var userId = GetUserId();
        await _cosmosDb.DeleteAsync(ContainerName, id, userId);
        return NoContent();
    }
}
