using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WhiskeyAndSmokes.Api;
using WhiskeyAndSmokes.Api.Models;
using WhiskeyAndSmokes.Api.Services;
using System.IO.Compression;
using System.Security.Claims;
using System.Text.Json;

namespace WhiskeyAndSmokes.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController : ControllerBase
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IAuthService _authService;
    private readonly IBlobStorageService _blobStorage;
    private readonly ILogger<UsersController> _logger;
    private const string ContainerName = "users";

    public UsersController(ICosmosDbService cosmosDb, IAuthService authService, IBlobStorageService blobStorage, ILogger<UsersController> logger)
    {
        _cosmosDb = cosmosDb;
        _authService = authService;
        _blobStorage = blobStorage;
        _logger = logger;
    }

    private string GetUserId() => User.FindFirstValue(ClaimTypes.NameIdentifier) ?? throw new UnauthorizedAccessException();

    [HttpGet("me")]
    public async Task<ActionResult<User>> GetCurrentUser()
    {
        using var activity = Diagnostics.Auth.StartActivity("UserGetProfile");
        var userId = GetUserId();
        activity?.SetTag("user.id", userId);
        _logger.LogDebug("Getting profile for user {UserId}", userId);

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null)
        {
            _logger.LogWarning("Profile not found for user {UserId}", userId);
            return NotFound();
        }

        _logger.LogInformation("Retrieved profile for user {UserId}", userId);
        return Ok(user.Sanitized());
    }

    [HttpPut("me")]
    public async Task<ActionResult<User>> UpdateCurrentUser([FromBody] UpdateUserRequest request)
    {
        using var activity = Diagnostics.Auth.StartActivity("UserUpdateProfile");
        var userId = GetUserId();
        activity?.SetTag("user.id", userId);
        _logger.LogDebug("Updating profile for user {UserId}", userId);

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null)
        {
            _logger.LogWarning("Profile not found for update, user {UserId}", userId);
            return NotFound();
        }

        if (request.DisplayName != null) user.DisplayName = request.DisplayName;
        if (request.Preferences != null) user.Preferences = request.Preferences;
        user.UpdatedAt = DateTime.UtcNow;

        user = await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        _logger.LogInformation("Updated profile for user {UserId}", userId);
        return Ok(user.Sanitized());
    }

    [HttpPut("me/password")]
    public async Task<IActionResult> ChangePassword([FromBody] ChangePasswordRequest request)
    {
        using var activity = Diagnostics.Auth.StartActivity("UserChangePassword");
        _logger.LogDebug("Password change attempt");

        if (string.IsNullOrWhiteSpace(request.NewPassword) || request.NewPassword.Length < 8)
        {
            _logger.LogWarning("Password change failed: new password too short or empty");
            return BadRequest(new { message = "New password must be at least 8 characters" });
        }

        var userId = GetUserId();
        activity?.SetTag("user.id", userId);

        var user = await _cosmosDb.GetAsync<User>(ContainerName, userId, userId);
        if (user == null)
        {
            _logger.LogWarning("Password change failed: user {UserId} not found", userId);
            return NotFound();
        }

        if (!_authService.VerifyPassword(request.CurrentPassword, user.PasswordHash))
        {
            _logger.LogWarning("Password change failed for user {UserId}: current password incorrect", userId);
            return BadRequest(new { message = "Current password is incorrect" });
        }

        user.PasswordHash = _authService.HashPassword(request.NewPassword);
        user.UpdatedAt = DateTime.UtcNow;
        await _cosmosDb.UpsertAsync(ContainerName, user, user.PartitionKey);

        _logger.LogInformation("Password changed successfully for user {UserId}", userId);
        return Ok(new { message = "Password changed successfully" });
    }

    [HttpGet("me/export")]
    public async Task<IActionResult> ExportData(CancellationToken cancellationToken)
    {
        using var activity = Diagnostics.Auth.StartActivity("UserExportData");
        var userId = GetUserId();
        activity?.SetTag("user.id", userId);
        _logger.LogInformation("Starting data export for user {UserId}", userId);

        var allItems = await QueryAllAsync<Item>("items", userId);
        var allCaptures = await QueryAllAsync<Capture>("captures", userId);

        var imageUrls = new HashSet<string>();
        foreach (var item in allItems)
            foreach (var url in item.PhotoUrls)
                imageUrls.Add(url);
        foreach (var capture in allCaptures)
            foreach (var url in capture.Photos)
                imageUrls.Add(url);

        _logger.LogInformation("Export for user {UserId}: {ItemCount} items, {CaptureCount} captures, {ImageCount} images",
            userId, allItems.Count, allCaptures.Count, imageUrls.Count);

        var jsonOptions = new JsonSerializerOptions { WriteIndented = true, PropertyNamingPolicy = JsonNamingPolicy.CamelCase };

        using var memoryStream = new MemoryStream();
        using (var archive = new ZipArchive(memoryStream, ZipArchiveMode.Create, leaveOpen: true))
        {
            var itemsEntry = archive.CreateEntry("data/items.json");
            await using (var stream = itemsEntry.Open())
                await JsonSerializer.SerializeAsync(stream, allItems, jsonOptions, cancellationToken);

            var capturesEntry = archive.CreateEntry("data/captures.json");
            await using (var stream = capturesEntry.Open())
                await JsonSerializer.SerializeAsync(stream, allCaptures, jsonOptions, cancellationToken);

            foreach (var url in imageUrls)
            {
                cancellationToken.ThrowIfCancellationRequested();
                var imageBytes = await _blobStorage.DownloadAsync(url, cancellationToken);
                if (imageBytes != null)
                {
                    var imagePath = ExtractImagePath(url);
                    var imageEntry = archive.CreateEntry($"images/{imagePath}", CompressionLevel.NoCompression);
                    await using var stream = imageEntry.Open();
                    await stream.WriteAsync(imageBytes, cancellationToken);
                }
            }
        }

        memoryStream.Position = 0;
        var fileName = $"whiskey-and-smokes-export-{DateTime.UtcNow:yyyy-MM-dd}.zip";
        return File(memoryStream.ToArray(), "application/zip", fileName);
    }

    private async Task<List<T>> QueryAllAsync<T>(string containerName, string partitionKey)
    {
        var all = new List<T>();
        string? token = null;
        do
        {
            var (items, nextToken) = await _cosmosDb.QueryAsync<T>(containerName, partitionKey, token, 100);
            all.AddRange(items);
            token = nextToken;
        } while (token != null);
        return all;
    }

    private static string ExtractImagePath(string url)
    {
        // URLs: /uploads/{userId}/{date}/{file} or https://host/container/{userId}/{date}/{file}
        var uploadsIdx = url.IndexOf("/uploads/", StringComparison.OrdinalIgnoreCase);
        if (uploadsIdx >= 0)
        {
            var path = url[(uploadsIdx + "/uploads/".Length)..];
            // Strip userId prefix — keep date/file
            var firstSlash = path.IndexOf('/');
            return firstSlash >= 0 ? path[(firstSlash + 1)..] : path;
        }

        // Azure blob URL — take last two segments (date/file)
        var uri = new Uri(url);
        var segments = uri.AbsolutePath.Split('/', StringSplitOptions.RemoveEmptyEntries);
        return segments.Length >= 2
            ? string.Join("/", segments[^2..])
            : segments[^1];
    }
}
