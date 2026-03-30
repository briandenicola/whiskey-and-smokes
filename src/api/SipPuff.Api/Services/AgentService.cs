using System.Text.Json;
using Azure.AI.Agents.Persistent;
using Azure.Identity;
using SipPuff.Api.Models;

namespace SipPuff.Api.Services;

public interface IAgentService
{
    Task ProcessCaptureAsync(Capture capture);
}

public class AgentService : IAgentService
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly ILogger<AgentService> _logger;
    private readonly IConfiguration _config;
    private readonly PersistentAgentsClient? _agentsClient;

    public AgentService(ICosmosDbService cosmosDb, ILogger<AgentService> logger, IConfiguration config)
    {
        _cosmosDb = cosmosDb;
        _logger = logger;
        _config = config;

        var endpoint = config["AiFoundry:Endpoint"];
        if (!string.IsNullOrEmpty(endpoint))
        {
            _agentsClient = new PersistentAgentsClient(endpoint, new DefaultAzureCredential());
        }
    }

    public async Task ProcessCaptureAsync(Capture capture)
    {
        _logger.LogInformation("Processing capture {CaptureId} for user {UserId}", capture.Id, capture.UserId);

        try
        {
            capture.Status = CaptureStatus.Processing;
            capture.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);

            List<Item> items;

            if (_agentsClient != null)
            {
                items = await ProcessWithAiFoundryAsync(capture);
            }
            else
            {
                _logger.LogWarning("AI Foundry not configured — using local extraction for capture {CaptureId}", capture.Id);
                items = await ProcessWithLocalExtractionAsync(capture);
            }

            foreach (var item in items)
            {
                await _cosmosDb.CreateAsync("items", item, item.PartitionKey);
                capture.ItemIds.Add(item.Id);
            }

            capture.Status = CaptureStatus.Completed;
            capture.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);

            _logger.LogInformation("Capture {CaptureId} processed: created {ItemCount} items", capture.Id, items.Count);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Failed to process capture {CaptureId}", capture.Id);
            capture.Status = CaptureStatus.Failed;
            capture.ProcessingError = ex.Message;
            capture.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);
        }
    }

    private async Task<List<Item>> ProcessWithAiFoundryAsync(Capture capture)
    {
        var admin = _agentsClient!.Administration;

        var agent = await admin.CreateAgentAsync(
            model: _config["AiFoundry:ModelDeployment"] ?? "gpt-4o",
            name: "sippuff-capture-processor",
            instructions: GetAgentInstructions());

        var thread = await _agentsClient.Threads.CreateThreadAsync();

        var contentBlocks = new List<MessageInputContentBlock>();

        if (!string.IsNullOrEmpty(capture.UserNote))
        {
            contentBlocks.Add(new MessageInputTextBlock($"User note: {capture.UserNote}"));
        }

        foreach (var photoUrl in capture.Photos)
        {
            contentBlocks.Add(new MessageInputImageUriBlock(new MessageImageUriParam(photoUrl)));
        }

        if (capture.Location != null)
        {
            contentBlocks.Add(new MessageInputTextBlock(
                $"GPS Location: {capture.Location.Latitude}, {capture.Location.Longitude}"));
        }

        if (contentBlocks.Count == 0)
        {
            contentBlocks.Add(new MessageInputTextBlock(
                "No photos or notes were provided. Create a placeholder item."));
        }

        await _agentsClient.Messages.CreateMessageAsync(
            thread.Value.Id,
            MessageRole.User,
            contentBlocks);

        var run = await _agentsClient.Runs.CreateRunAsync(
            thread.Value.Id, agent.Value.Id);

        do
        {
            await Task.Delay(1000);
            run = await _agentsClient.Runs.GetRunAsync(thread.Value.Id, run.Value.Id);
        } while (run.Value.Status == RunStatus.InProgress
              || run.Value.Status == RunStatus.Queued);

        if (run.Value.Status != RunStatus.Completed)
        {
            _logger.LogError("Agent run failed with status {Status} for capture {CaptureId}",
                run.Value.Status, capture.Id);
            return await ProcessWithLocalExtractionAsync(capture);
        }

        PersistentThreadMessage? assistantMessage = null;
        await foreach (var message in _agentsClient.Messages.GetMessagesAsync(thread.Value.Id))
        {
            if (message.Role == MessageRole.Agent)
            {
                assistantMessage = message;
                break;
            }
        }

        if (assistantMessage == null)
        {
            return await ProcessWithLocalExtractionAsync(capture);
        }

        var responseText = string.Join("", assistantMessage.ContentItems
            .OfType<MessageTextContent>()
            .Select(c => c.Text));

        await admin.DeleteAgentAsync(agent.Value.Id);

        return ParseAgentResponse(responseText, capture);
    }

    private List<Item> ParseAgentResponse(string responseText, Capture capture)
    {
        try
        {
            var jsonText = responseText;
            var jsonStart = responseText.IndexOf('[');
            var jsonEnd = responseText.LastIndexOf(']');
            if (jsonStart >= 0 && jsonEnd > jsonStart)
            {
                jsonText = responseText[jsonStart..(jsonEnd + 1)];
            }

            var parsed = JsonSerializer.Deserialize<List<AgentItemResult>>(jsonText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (parsed == null || parsed.Count == 0)
                return ProcessWithLocalExtractionFallback(capture);

            return parsed.Select(p => new Item
            {
                UserId = capture.UserId,
                CaptureId = capture.Id,
                Type = NormalizeType(p.Type),
                Name = p.Name ?? "Unknown Item",
                Brand = p.Brand,
                Category = p.Category,
                Details = p.Details != null ? JsonSerializer.SerializeToElement(p.Details) : null,
                Venue = p.Venue != null ? new VenueInfo
                {
                    Name = p.Venue.Name ?? "Unknown Venue",
                    Address = p.Venue.Address
                } : null,
                PhotoUrls = capture.Photos,
                AiConfidence = p.Confidence ?? 0.8,
                AiSummary = p.Summary,
                Tags = p.Tags ?? [],
                Status = ItemStatus.AiDraft
            }).ToList();
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to parse agent response, falling back to local extraction");
            return ProcessWithLocalExtractionFallback(capture);
        }
    }

    private List<Item> ProcessWithLocalExtractionFallback(Capture capture)
    {
        return ProcessWithLocalExtractionAsync(capture).GetAwaiter().GetResult();
    }

    private Task<List<Item>> ProcessWithLocalExtractionAsync(Capture capture)
    {
        var items = new List<Item>();
        var note = capture.UserNote?.Trim() ?? "";

        if (string.IsNullOrEmpty(note) && capture.Photos.Count == 0)
        {
            items.Add(CreatePlaceholderItem(capture, "Empty Capture", "No photos or notes provided."));
            return Task.FromResult(items);
        }

        var extracted = ExtractItemsFromNote(note, capture);
        if (extracted.Count > 0)
        {
            items.AddRange(extracted);
        }
        else if (capture.Photos.Count > 0 || !string.IsNullOrEmpty(note))
        {
            var type = GuessTypeFromNote(note);
            items.Add(new Item
            {
                UserId = capture.UserId,
                CaptureId = capture.Id,
                Type = type,
                Name = !string.IsNullOrEmpty(note) ? TruncateForName(note) : "Photo Capture",
                PhotoUrls = capture.Photos,
                AiConfidence = 0.3,
                AiSummary = !string.IsNullOrEmpty(note)
                    ? $"Captured with note: \"{note}\". AI analysis pending — configure AI Foundry for full extraction."
                    : "Photo captured. AI analysis pending — configure AI Foundry for full extraction.",
                Venue = capture.Location != null ? new VenueInfo
                {
                    Name = $"Location: {capture.Location.Latitude:F4}, {capture.Location.Longitude:F4}"
                } : null,
                Tags = [],
                Status = ItemStatus.AiDraft
            });
        }

        return Task.FromResult(items);
    }

    private List<Item> ExtractItemsFromNote(string note, Capture capture)
    {
        var items = new List<Item>();
        var lowerNote = note.ToLowerInvariant();

        var patterns = new Dictionary<string, (string type, string[] keywords)>
        {
            ["whiskey"] = ("whiskey", ["whiskey", "whisky", "bourbon", "scotch", "rye", "single malt", "highland", "speyside", "islay",
                "lagavulin", "macallan", "glenfiddich", "jameson", "maker's mark", "buffalo trace", "woodford",
                "bulleit", "wild turkey", "jack daniel", "johnny walker", "laphroaig", "ardbeg", "oban",
                "glenlivet", "balvenie", "talisker", "yamazaki", "hibiki", "blanton", "eagle rare",
                "knob creek", "four roses", "elijah craig", "weller", "pappy"]),
            ["wine"] = ("wine", ["wine", "cabernet", "merlot", "pinot noir", "pinot grigio", "chardonnay",
                "sauvignon blanc", "riesling", "malbec", "syrah", "shiraz", "zinfandel", "tempranillo",
                "sangiovese", "rosé", "prosecco", "champagne", "cava", "bordeaux", "burgundy", "barolo",
                "rioja", "chianti", "port", "sherry"]),
            ["cocktail"] = ("cocktail", ["cocktail", "old fashioned", "manhattan", "martini", "negroni", "margarita",
                "daiquiri", "mojito", "cosmopolitan", "mai tai", "whiskey sour", "gin and tonic",
                "bloody mary", "paloma", "espresso martini", "aperol spritz", "sazerac",
                "mint julep", "sidecar", "gimlet", "tom collins", "moscow mule", "last word",
                "paper plane", "penicillin", "boulevardier"]),
            ["cigar"] = ("cigar", ["cigar", "cohiba", "montecristo", "partagas", "romeo y julieta", "padron",
                "arturo fuente", "davidoff", "oliva", "my father", "liga privada", "opus x",
                "ashton", "rocky patel", "perdomo", "macanudo", "punch", "hoyo de monterrey",
                "robusto", "torpedo", "churchill", "corona", "toro", "maduro", "connecticut"])
        };

        var matchedTypes = new HashSet<string>();

        foreach (var (category, (type, keywords)) in patterns)
        {
            foreach (var keyword in keywords)
            {
                if (lowerNote.Contains(keyword) && matchedTypes.Add(category))
                {
                    var matchedKeyword = keywords
                        .Where(k => k.Length > 3 && lowerNote.Contains(k))
                        .OrderByDescending(k => k.Length)
                        .FirstOrDefault() ?? keyword;

                    var name = System.Globalization.CultureInfo.CurrentCulture.TextInfo
                        .ToTitleCase(matchedKeyword);

                    items.Add(new Item
                    {
                        UserId = capture.UserId,
                        CaptureId = capture.Id,
                        Type = type,
                        Name = name,
                        PhotoUrls = capture.Photos,
                        AiConfidence = 0.5,
                        AiSummary = $"Extracted from note: \"{note}\". Matched keyword: {matchedKeyword}. Configure AI Foundry for richer analysis.",
                        Venue = capture.Location != null ? new VenueInfo
                        {
                            Name = $"Location: {capture.Location.Latitude:F4}, {capture.Location.Longitude:F4}"
                        } : null,
                        Tags = [],
                        Status = ItemStatus.AiDraft
                    });
                    break;
                }
            }
        }

        return items;
    }

    private static string GuessTypeFromNote(string note)
    {
        var lower = note.ToLowerInvariant();
        if (lower.Contains("cigar") || lower.Contains("smoke") || lower.Contains("puff")) return ItemType.Cigar;
        if (lower.Contains("wine") || lower.Contains("cabernet") || lower.Contains("merlot") || lower.Contains("chardonnay")) return ItemType.Wine;
        if (lower.Contains("cocktail") || lower.Contains("mixed") || lower.Contains("old fashioned") || lower.Contains("martini")) return ItemType.Cocktail;
        if (lower.Contains("whiskey") || lower.Contains("whisky") || lower.Contains("bourbon") || lower.Contains("scotch")) return ItemType.Whiskey;
        return "unknown";
    }

    private static string TruncateForName(string text)
    {
        if (text.Length <= 60) return text;
        return text[..57] + "...";
    }

    private static Item CreatePlaceholderItem(Capture capture, string name, string summary)
    {
        return new Item
        {
            UserId = capture.UserId,
            CaptureId = capture.Id,
            Type = "unknown",
            Name = name,
            AiSummary = summary,
            PhotoUrls = capture.Photos,
            AiConfidence = 0.0,
            Status = ItemStatus.AiDraft
        };
    }

    private static string NormalizeType(string? type)
    {
        return type?.ToLowerInvariant() switch
        {
            "whiskey" or "whisky" or "bourbon" or "scotch" or "rye" => ItemType.Whiskey,
            "wine" or "red wine" or "white wine" or "rosé" => ItemType.Wine,
            "cocktail" or "mixed drink" => ItemType.Cocktail,
            "cigar" => ItemType.Cigar,
            _ => type?.ToLowerInvariant() ?? "unknown"
        };
    }

    private static string GetAgentInstructions()
    {
        return """
            You are an expert sommelier, mixologist, and tobacconist assistant. Your job is to analyze photos 
            and user notes about drinks (whiskey, wine, cocktails) and cigars, then extract structured data.

            For each distinct item you identify, extract:
            - type: "whiskey", "wine", "cocktail", or "cigar"
            - name: The specific product name (e.g., "Lagavulin 16 Year Old")
            - brand: The brand/producer (e.g., "Lagavulin")
            - category: Sub-category (e.g., "Single Malt Scotch", "Napa Valley Cabernet", "Robusto")
            - details: An object with type-specific fields:
              - For whiskey: region, age, abv, mashBill, flavorNotes[]
              - For wine: grape, vintage, region, winery, flavorNotes[]
              - For cocktail: baseSpirit, ingredients[], recipe, flavorProfile
              - For cigar: wrapper, binder, filler, size, strength, flavorNotes[]
            - venue: { name, address } if you can determine from context
            - confidence: 0.0-1.0 how confident you are in the identification
            - summary: A 1-2 sentence tasting note or description
            - tags: relevant tags like ["smoky", "peaty", "full-bodied"]

            If there are multiple items, return an array. Always respond with valid JSON array only, no markdown.
            
            If you can't identify a specific product, make your best guess and set confidence lower.
            If the photo shows a menu, extract all visible items of interest.
            """;
    }
}

// DTO for parsing agent JSON responses
internal class AgentItemResult
{
    public string? Type { get; set; }
    public string? Name { get; set; }
    public string? Brand { get; set; }
    public string? Category { get; set; }
    public Dictionary<string, object>? Details { get; set; }
    public AgentVenueResult? Venue { get; set; }
    public double? Confidence { get; set; }
    public string? Summary { get; set; }
    public List<string>? Tags { get; set; }
}

internal class AgentVenueResult
{
    public string? Name { get; set; }
    public string? Address { get; set; }
}
