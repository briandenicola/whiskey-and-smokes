namespace WhiskeyAndSmokes.Api.Agents.Models;

/// <summary>
/// Output of the Domain Expert — detailed product identifications with expert knowledge.
/// </summary>
public class ExpertAnalysis
{
    public required string CaptureId { get; init; }
    public required string Analysis { get; init; }
    public int RefinementCount { get; init; }
}
