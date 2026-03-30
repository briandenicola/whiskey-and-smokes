using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace SipPuff.Api.Controllers;

[ApiController]
[Route("uploads")]
public class UploadsController : ControllerBase
{
    private readonly string _storagePath;
    private readonly IWebHostEnvironment _env;

    public UploadsController(IConfiguration config, IWebHostEnvironment env)
    {
        _storagePath = config["LocalStorage:Path"] ?? Path.Combine(
            Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData),
            "sippuff", "uploads");
        _env = env;
    }

    [HttpPut("direct-upload")]
    [Authorize]
    [RequestSizeLimit(20_000_000)] // 20MB
    public async Task<IActionResult> DirectUpload([FromQuery] string path)
    {
        if (!_env.IsDevelopment())
            return NotFound();

        var safePath = path.Replace("..", "").Replace('\\', '/');
        var fullPath = Path.Combine(_storagePath, safePath.Replace('/', Path.DirectorySeparatorChar));

        Directory.CreateDirectory(Path.GetDirectoryName(fullPath)!);

        using var stream = new FileStream(fullPath, FileMode.Create);
        await Request.Body.CopyToAsync(stream);

        return Ok();
    }

    [HttpGet("{**filePath}")]
    [AllowAnonymous]
    public IActionResult GetFile(string filePath)
    {
        if (!_env.IsDevelopment())
            return NotFound();

        var safePath = filePath.Replace("..", "");
        var fullPath = Path.Combine(_storagePath, safePath.Replace('/', Path.DirectorySeparatorChar));

        if (!System.IO.File.Exists(fullPath))
            return NotFound();

        var contentType = Path.GetExtension(fullPath).ToLowerInvariant() switch
        {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png" => "image/png",
            ".gif" => "image/gif",
            ".webp" => "image/webp",
            ".heic" => "image/heic",
            _ => "application/octet-stream"
        };

        return PhysicalFile(fullPath, contentType);
    }
}
