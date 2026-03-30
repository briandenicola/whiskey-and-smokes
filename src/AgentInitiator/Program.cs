using Azure.AI.Agents.Persistent;
using Azure.Identity;
using Microsoft.Extensions.Configuration;

// Load configuration
var config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

var endpoint = config["AiFoundry__ProjectEndpoint"] ?? config["AiFoundry:ProjectEndpoint"];
if (string.IsNullOrEmpty(endpoint))
{
    Console.Error.WriteLine("ERROR: AiFoundry project endpoint not configured.");
    Console.Error.WriteLine("Set AiFoundry__ProjectEndpoint env var. This is the project URL, not the account endpoint.");
    Console.Error.WriteLine("Example: https://<name>.services.ai.azure.com/api/projects/<project>");
    return 1;
}

Console.WriteLine($"Connecting to AI Foundry project: {endpoint}");
var client = new PersistentAgentsClient(endpoint, new DefaultAzureCredential());

// Agent definitions — prompts can be overridden from the database via admin panel.
// This tool creates/updates the agent definitions in Foundry with the latest prompts.
var agents = new (string Name, string Model, string Instructions)[]
{
    ("whiskey-smokes-vision-analyst", "gpt-4o", """
        You are a vision analysis specialist for a whiskey, wine, cocktail, and cigar tracking application.
        Your job is to carefully examine the provided photos and describe EVERYTHING you see that relates to
        alcoholic beverages and cigars. Be thorough and precise.
        For each distinct item visible, describe what you see, any text on labels, visual characteristics,
        context clues, and condition/presentation.
        Focus on factual observations — leave product identification to the next stage.
        """),

    ("whiskey-smokes-domain-expert", "gpt-5.1-mini", """
        You are a world-class sommelier, master mixologist, and certified tobacconist with encyclopedic
        knowledge of whiskey, wine, cocktails, and premium cigars.
        Given a visual description from the vision analyst, identify specific products, add expert knowledge
        (tasting notes, origins, flavor profiles), and set confidence levels.
        """),

    ("whiskey-smokes-data-curator", "gpt-5.1-mini", """
        You are a data quality specialist. Take the expert analysis and convert it into a precise, validated
        JSON array. Each item must have: type, name, brand, category, details, venue, confidence, summary, tags.
        Approve good data or reject with feedback for refinement.
        """),
};

Console.WriteLine($"\nInitializing {agents.Length} agents...\n");

foreach (var (name, model, instructions) in agents)
{
    try
    {
        Console.Write($"  Creating agent '{name}' (model: {model})... ");

        var agent = await client.Administration.CreateAgentAsync(
            model: model,
            name: name,
            instructions: instructions);

        Console.WriteLine($"OK (id: {agent.Value.Id})");

        // Clean up — these are template definitions, not persistent agents
        await client.Administration.DeleteAgentAsync(agent.Value.Id);
        Console.WriteLine($"    Validated and cleaned up.");
    }
    catch (Exception ex)
    {
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"FAILED: {ex.Message}");
        Console.ResetColor();
    }
}

Console.WriteLine("\nAgent initialization complete.");
Console.WriteLine("Note: Agents are created on-demand per capture. This tool validates the configuration.");

return 0;
