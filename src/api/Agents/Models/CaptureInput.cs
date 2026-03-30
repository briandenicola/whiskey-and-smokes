namespace WhiskeyAndSmokes.Api.Agents.Models;

/// <summary>
/// Input to the capture analysis workflow — photos, user notes, and location.
/// </summary>
public class CaptureInput
{
    public required string CaptureId { get; init; }
    public required string UserId { get; init; }
    public required List<string> PhotoUrls { get; init; }
    public string? UserNote { get; init; }
    public GeoCoordinate? Location { get; init; }
}

public class GeoCoordinate
{
    public double Latitude { get; init; }
    public double Longitude { get; init; }
}
