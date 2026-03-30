namespace WhiskeyAndSmokes.Api.Agents.Models;

/// <summary>
/// Output of the Vision Analyst — a textual description of what was seen in the photos.
/// </summary>
public class VisionDescription
{
    public required string CaptureId { get; init; }
    public required string Description { get; init; }
    public string? UserNote { get; init; }
    public GeoCoordinate? Location { get; init; }
    public int PhotoCount { get; init; }
}
