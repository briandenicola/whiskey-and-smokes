using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using WhiskeyAndSmokes.Api;

namespace WhiskeyAndSmokes.Api.Controllers;

[ApiController]
[Route("uploads")]
public class UploadsController : ControllerBase
{
    private readonly string _storagePath;
    private readonly bool _isLocalStorage;
    private readonly ILogger<UploadsController> _logger;

    private static readonly HashSet<string> AllowedImageExtensions =
        [".jpg", ".jpeg", ".png", ".gif", ".webp", ".heic", ".heif"];

    public UploadsController(IConfiguration config, IWebHostEnvironment env, ILogger<UploadsController> logger)
    {
        _storagePath = config["LocalStorage:Path"] ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "whiskey-and-smokes", "uploads");
        var provider = config["Storage:Provider"]?.ToLowerInvariant() ?? "auto";
        _isLocalStorage = provider == "local" ||
            (provider == "auto" && env.IsDevelopment());
        _logger = logger;
    }

    [HttpPut("direct-upload")]
    [Authorize]
    [RequestSizeLimit(20_000_000)] // 20MB
    public async Task<IActionResult> DirectUpload([FromQuery] string path)
    {
        using var activity = Diagnostics.Storage.StartActivity("UploadDirectUpload");
        activity?.SetTag("upload.path", path);
        _logger.LogDebug("Direct upload requested for path {Path}", path);

        if (!_isLocalStorage)
            return NotFound();

        if (string.IsNullOrWhiteSpace(path))
            return BadRequest(new { message = "Path is required" });

        var fullPath = Path.GetFullPath(Path.Combine(_storagePath, path.Replace('/', Path.DirectorySeparatorChar)));
        if (!fullPath.StartsWith(Path.GetFullPath(_storagePath), StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Path traversal attempt blocked: {Path}", path);
            return BadRequest(new { message = "Invalid path" });
        }

        // Validate file extension
        var ext = Path.GetExtension(fullPath).ToLowerInvariant();
        if (!AllowedImageExtensions.Contains(ext))
        {
            _logger.LogWarning("Rejected upload with disallowed extension: {Extension}", ext);
            return BadRequest(new { message = $"File type {ext} is not allowed" });
        }

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        using var stream = new FileStream(fullPath, FileMode.Create);
        await Request.Body.CopyToAsync(stream);

        var sizeBytes = stream.Length;
        activity?.SetTag("upload.size_bytes", sizeBytes);
        _logger.LogInformation("File uploaded: path={Path}, size={SizeBytes} bytes", path, sizeBytes);
        return Ok();
    }

    [HttpGet("{**filePath}")]
    [AllowAnonymous]
    public IActionResult GetFile(string filePath)
    {
        using var activity = Diagnostics.Storage.StartActivity("UploadGetFile");
        activity?.SetTag("upload.path", filePath);
        _logger.LogDebug("File requested: {FilePath}", filePath);

        if (!_isLocalStorage)
            return NotFound();

        var fullPath = Path.GetFullPath(Path.Combine(_storagePath, filePath.Replace('/', Path.DirectorySeparatorChar)));
        if (!fullPath.StartsWith(Path.GetFullPath(_storagePath), StringComparison.OrdinalIgnoreCase))
        {
            _logger.LogWarning("Path traversal attempt blocked on read: {FilePath}", filePath);
            return BadRequest(new { message = "Invalid path" });
        }

        if (!System.IO.File.Exists(fullPath))
        {
            _logger.LogWarning("File not found: {FilePath}", filePath);
            return NotFound();
        }

        var contentType = Path.GetExtension(fullPath).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".heic" => "image/heic",
            _ => "application/octet-stream"
        };

        _logger.LogInformation("Serving file: {FilePath}, contentType={ContentType}", filePath, contentType);
        return PhysicalFile(fullPath, contentType);
    }
}
