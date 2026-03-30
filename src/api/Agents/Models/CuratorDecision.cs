using System.Text.Json.Serialization;

namespace WhiskeyAndSmokes.Api.Agents.Models;

/// <summary>
/// Output of the Data Curator — either approved structured items or a rejection with feedback.
/// </summary>
public class CuratorDecision
{
    [JsonPropertyName("decision")]
    public required string Decision { get; set; }

    [JsonPropertyName("reason")]
    public string? Reason { get; set; }

    [JsonPropertyName("items")]
    public List<CuratorItemResult>? Items { get; set; }

    public bool IsApproved => Decision.Equals("approve", StringComparison.OrdinalIgnoreCase);
}

public class CuratorItemResult
{
    [JsonPropertyName("type")]
    public string? Type { get; set; }

    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("brand")]
    public string? Brand { get; set; }

    [JsonPropertyName("category")]
    public string? Category { get; set; }

    [JsonPropertyName("details")]
    public Dictionary<string, object>? Details { get; set; }

    [JsonPropertyName("venue")]
    public CuratorVenueResult? Venue { get; set; }

    [JsonPropertyName("confidence")]
    public double? Confidence { get; set; }

    [JsonPropertyName("summary")]
    public string? Summary { get; set; }

    [JsonPropertyName("tags")]
    public List<string>? Tags { get; set; }
}

public class CuratorVenueResult
{
    [JsonPropertyName("name")]
    public string? Name { get; set; }

    [JsonPropertyName("address")]
    public string? Address { get; set; }
}
