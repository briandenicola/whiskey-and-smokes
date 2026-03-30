using WhiskeyAndSmokes.Api;
using WhiskeyAndSmokes.Api.Models;

namespace WhiskeyAndSmokes.Api.Services;

public interface IPromptService
{
    Task<List<Prompt>> GetAllAsync();
    Task<Prompt?> GetAsync(string id);
    Task<Prompt> UpsertAsync(Prompt prompt);
    Task SeedDefaultsAsync();
}

public class PromptService : IPromptService
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly ILogger<PromptService> _logger;
    private const string ContainerName = "prompts";

    public PromptService(ICosmosDbService cosmosDb, ILogger<PromptService> logger)
    {
        _cosmosDb = cosmosDb;
        _logger = logger;
    }

    public async Task<List<Prompt>> GetAllAsync()
    {
        using var activity = Diagnostics.General.StartActivity("Prompts.GetAll");

        _logger.LogDebug("Fetching all prompts from container={Container}", ContainerName);
        var (prompts, _) = await _cosmosDb.QueryAsync<Prompt>(ContainerName, "prompts");
        _logger.LogInformation("Fetched {PromptCount} prompts from container={Container}", prompts.Count, ContainerName);

        return prompts;
    }

    public async Task<Prompt?> GetAsync(string id)
    {
        using var activity = Diagnostics.General.StartActivity("Prompts.Get");
        activity?.SetTag("prompt.id", id);

        _logger.LogDebug("Fetching prompt {PromptId} from container={Container}", id, ContainerName);
        var prompt = await _cosmosDb.GetAsync<Prompt>(ContainerName, id, "prompts");

        if (prompt != null)
        {
            _logger.LogDebug("Prompt {PromptId} found: name={PromptName}, contentLength={ContentLength}",
                id, prompt.Name, prompt.Content?.Length ?? 0);
        }
        else
        {
            _logger.LogDebug("Prompt {PromptId} not found in container={Container}", id, ContainerName);
        }

        return prompt;
    }

    public async Task<Prompt> UpsertAsync(Prompt prompt)
    {
        using var activity = Diagnostics.General.StartActivity("Prompts.Upsert");
        activity?.SetTag("prompt.id", prompt.Id);

        _logger.LogInformation("Upserting prompt {PromptId}: name={PromptName}, contentLength={ContentLength}, updatedBy={UpdatedBy}",
            prompt.Id, prompt.Name, prompt.Content?.Length ?? 0, prompt.UpdatedBy);

        prompt.UpdatedAt = DateTime.UtcNow;
        var result = await _cosmosDb.UpsertAsync(ContainerName, prompt, prompt.PartitionKey);

        _logger.LogInformation("Prompt {PromptId} upserted successfully at {UpdatedAt}", prompt.Id, prompt.UpdatedAt);
        return result;
    }

    public async Task SeedDefaultsAsync()
    {
        using var activity = Diagnostics.General.StartActivity("Prompts.SeedDefaults");

        _logger.LogDebug("Checking if default prompts need seeding");

        var promptsToSeed = new (string Id, string Name, string Description, string Content)[]
        {
            (PromptIds.AgentInstructions, "Capture Analysis Agent (Legacy)",
             "Legacy monolithic prompt. Replaced by the 3 specialized agent prompts below.",
             DefaultPrompts.AgentInstructions),
            (PromptIds.VisionAnalyst, "Vision Analyst",
             "Examines uploaded photos and describes visible items — bottles, labels, glasses, cigar bands, menus. Used by the Vision Analyst agent (gpt-4o).",
             DefaultPrompts.VisionAnalyst),
            (PromptIds.DomainExpert, "Domain Expert",
             "Identifies specific products from visual descriptions and adds expert knowledge — tasting notes, origins, flavor profiles. Used by the Domain Expert agent (gpt-5.1-mini).",
             DefaultPrompts.DomainExpert),
            (PromptIds.DataCurator, "Data Curator",
             "Structures agent output into validated JSON matching the Item schema. Approves or sends back for refinement. Used by the Data Curator agent (gpt-5.1-mini).",
             DefaultPrompts.DataCurator),
        };

        foreach (var (id, name, description, content) in promptsToSeed)
        {
            var existing = await GetAsync(id);
            if (existing != null)
            {
                _logger.LogDebug("Prompt {PromptId} already exists — skipping seed", id);
                continue;
            }

            _logger.LogInformation("Seeding default prompt: {PromptId} (contentLength={ContentLength})", id, content.Length);
            await UpsertAsync(new Prompt
            {
                Id = id,
                Name = name,
                Description = description,
                Content = content,
                UpdatedBy = "system"
            });
        }

        _logger.LogInformation("Default prompt seeding complete");
    }
}

public static class DefaultPrompts
{
    public const string AgentInstructions = """
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

    public const string VisionAnalyst = """
        You are a vision analysis specialist for a whiskey, wine, cocktail, and cigar tracking application.
        
        Your job is to carefully examine the provided photos and describe EVERYTHING you see that relates to
        alcoholic beverages and cigars. Be thorough and precise.

        For each distinct item visible in the photos, describe:
        1. **What you see**: The physical object (bottle, glass, cigar, menu, label, band, box)
        2. **Text you can read**: Any brand names, product names, vintage years, ABV, origin info on labels
        3. **Visual characteristics**: Color of liquid, shape of glass, wrapper color of cigar, label design
        4. **Context clues**: Bar/restaurant setting, flight/tasting setup, pairing arrangements
        5. **Condition/presentation**: How the item is served, garnishes, ice, cut of cigar

        If the user provided notes, incorporate that context into your analysis.
        If there's a GPS location, note it for venue identification.
        If you see a menu, transcribe all relevant drink/cigar items visible.

        Respond in plain text with a structured description of each item you see. Number them if multiple.
        Focus on factual observations — leave product identification to the next stage.
        """;

    public const string DomainExpert = """
        You are a world-class sommelier, master mixologist, and certified tobacconist with encyclopedic
        knowledge of whiskey, wine, cocktails, and premium cigars.

        Given a visual description of items from photos, your job is to:

        1. **Identify the specific product**: Match the visual description to real products.
           - For whiskey: name, distillery, age, region (Highland, Speyside, Islay, Bourbon, etc.), ABV, mash bill
           - For wine: name, winery, grape varietal, vintage, region (Napa, Bordeaux, Barolo, etc.)
           - For cocktails: name, base spirit, classic recipe, ingredients, garnish
           - For cigars: brand, line, vitola (Robusto, Toro, Churchill, etc.), wrapper/binder/filler, strength

        2. **Add expert knowledge**:
           - Tasting notes and flavor profiles based on your knowledge of the product
           - Typical price range and availability
           - Recommended pairings (whiskey + cigar, wine + food, etc.)
           - Historical or notable facts

        3. **Set a confidence level** (0.0–1.0):
           - 0.9+ : You can clearly read the label and it's an unambiguous match
           - 0.7–0.9 : High confidence based on visual cues but some uncertainty
           - 0.5–0.7 : Educated guess based on partial information
           - Below 0.5 : Speculative, note what's uncertain

        If the visual description is ambiguous, provide your best identification and explain your reasoning.
        Respond in structured text for each item. The data curator will convert to JSON.
        """;

    public const string DataCurator = """
        You are a data quality specialist. Your job is to take the expert analysis of drinks and cigars
        and convert it into a precise, validated JSON array matching our schema.

        For each item, output a JSON object with these exact fields:
        {
          "type": "whiskey" | "wine" | "cocktail" | "cigar",
          "name": "Product Name",
          "brand": "Brand/Producer",
          "category": "Sub-category",
          "details": {
            // For whiskey: { "region", "age", "abv", "mashBill", "flavorNotes": [] }
            // For wine: { "grape", "vintage", "region", "winery", "flavorNotes": [] }
            // For cocktail: { "baseSpirit", "ingredients": [], "recipe", "flavorProfile" }
            // For cigar: { "wrapper", "binder", "filler", "size", "strength", "flavorNotes": [] }
          },
          "venue": { "name": "Venue Name", "address": "Address" } | null,
          "confidence": 0.0-1.0,
          "summary": "1-2 sentence tasting note",
          "tags": ["tag1", "tag2"]
        }

        VALIDATION RULES:
        - "type" must be exactly one of: whiskey, wine, cocktail, cigar
        - "name" is required and cannot be empty
        - "confidence" must be a number between 0.0 and 1.0
        - "tags" must be an array of lowercase strings
        - "details" fields must match the type (don't put wine fields in a whiskey item)
        - All text should be properly capitalized (Title Case for names, brands)

        QUALITY CHECK:
        - If the expert's identification seems inconsistent or has obvious errors, respond with:
          { "decision": "reject", "reason": "explanation of what needs fixing" }
        - If the data looks good, respond with:
          { "decision": "approve", "items": [ ... array of validated items ... ] }

        Always respond with valid JSON only. No markdown, no commentary outside the JSON.
        """;
}
