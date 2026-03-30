using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SipPuff.Api.Models;
using SipPuff.Api.Services;
using System.Security.Claims;

namespace SipPuff.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CapturesController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IBlobStorageService _blobStorage;
    private readonly IAgentService _agentService;
    private const string ContainerName = "captures";

    public CapturesController(ICosmosDbService cosmosDb, IBlobStorageService blobStorage, IAgentService agentService)
    {
        _cosmosDb = cosmosDb;
        _blobStorage = blobStorage;
        _agentService = agentService;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpPost("upload-url")]
    public async Task<ActionResult<UploadUrlResponse>> GetUploadUrl([FromQuery] string fileName)
    {
        var userId = GetUserId();
        var (uploadUrl, blobUrl) = await _blobStorage.GenerateUploadUrlAsync(userId, fileName);
        return Ok(new UploadUrlResponse { UploadUrl = uploadUrl, BlobUrl = blobUrl });
    }

    [HttpPost]
    public async Task<ActionResult<CaptureResponse>> CreateCapture([FromBody] CreateCaptureRequest request)
    {
        var userId = GetUserId();
        var capture = new Capture
        {
            UserId = userId,
            UserNote = request.UserNote,
            Location = request.Location,
            Photos = request.Photos ?? [],
            Status = CaptureStatus.Pending
        };

        capture = await _cosmosDb.CreateAsync(ContainerName, capture, capture.PartitionKey);

        // Fire-and-forget AI processing
        _ = Task.Run(() => _agentService.ProcessCaptureAsync(capture));

        return CreatedAtAction(nameof(GetCapture), new { id = capture.Id }, MapToResponse(capture));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<CaptureResponse>> GetCapture(string id)
    {
        var userId = GetUserId();
        var capture = await _cosmosDb.GetAsync<Capture>(ContainerName, id, userId);
        if (capture == null) return NotFound();
        return Ok(MapToResponse(capture));
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<CaptureResponse>>> ListCaptures([FromQuery] string? continuationToken)
    {
        var userId = GetUserId();
        var (captures, nextToken) = await _cosmosDb.QueryAsync<Capture>(ContainerName, userId, continuationToken);

        return Ok(new PagedResponse<CaptureResponse>
        {
            Items = captures.Select(MapToResponse).ToList(),
            ContinuationToken = nextToken,
            HasMore = nextToken != null
        });
    }

    private static CaptureResponse MapToResponse(Capture c) => new()
    {
        Id = c.Id,
        Status = c.Status,
        Photos = c.Photos,
        UserNote = c.UserNote,
        Location = c.Location,
        ItemIds = c.ItemIds,
        CreatedAt = c.CreatedAt
    };
}
