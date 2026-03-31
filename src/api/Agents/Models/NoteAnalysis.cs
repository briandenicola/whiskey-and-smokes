using System.Text.Json.Serialization;

namespace WhiskeyAndSmokes.Api.Agents.Models;

/// <summary>
/// Output of the Note Analyst agent — venue, sentiment, and occasion extracted from user notes.
/// </summary>
public class NoteAnalysis
{
    [JsonPropertyName("venue")]
    public NoteVenueResult? Venue { get; set; }

    [JsonPropertyName("suggestedRating")]
    public int? SuggestedRating { get; set; }

    [JsonPropertyName("occasion")]
    public string? Occasion { get; set; }

    [JsonPropertyName("sentiment")]
    public string? Sentiment { get; set; }
}

public class NoteVenueResult
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("address")]
    public string? Address { get; set; }
}
