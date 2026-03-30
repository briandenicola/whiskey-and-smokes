using System.Diagnostics;
using Azure.AI.Projects;
using Azure.AI.Projects.OpenAI;
using Azure.Identity;
using Microsoft.Extensions.Configuration;

// ─────────────────────────────────────────────────────────────────────────────
// Whiskey & Smokes Agent Initializer CLI
// Creates versioned agents in the new Foundry Agent Service.
// SDK: Azure.AI.Projects 2.0 (AIProjectClient, PromptAgentDefinition)
// Auth: Entra ID (AzureCliCredential → ManagedIdentityCredential)
// ─────────────────────────────────────────────────────────────────────────────

var sw = Stopwatch.StartNew();

var config = new ConfigurationBuilder()
    .AddJsonFile("appsettings.json", optional: true)
    .AddEnvironmentVariables()
    .Build();

var endpoint = config["AiFoundry__ProjectEndpoint"]
    ?? config["AiFoundry:ProjectEndpoint"]
    ?? args.FirstOrDefault(a => a.StartsWith("--endpoint="))?.Split('=', 2)[1]
    ?? "";

if (string.IsNullOrEmpty(endpoint))
{
    Console.Error.WriteLine("ERROR: AiFoundry project endpoint not configured.");
    Console.Error.WriteLine("Set AiFoundry__ProjectEndpoint env var or pass --endpoint=<URL>");
    Console.Error.WriteLine("Example: https://<name>.services.ai.azure.com/api/projects/<project>");
    return 1;
}

Console.WriteLine("🥃💨 Whiskey & Smokes Agent Initializer (New Foundry Agent API)");
Console.WriteLine($"   Endpoint: {endpoint}");
Console.WriteLine($"   API:      AIProjectClient.Agents.CreateAgentVersionAsync");
Console.WriteLine();
Console.WriteLine("   Model Assignments:");
Console.WriteLine("     gpt-4o       → Vision Analyst (image analysis)");
Console.WriteLine("     gpt-5-mini   → Domain Expert, Data Curator (reasoning)");
Console.WriteLine();

// ── Step 1: Acquire Entra ID credential ───────────────────────────────────
Console.WriteLine("Step 1: Acquiring Entra ID credential...");
var credSw = Stopwatch.StartNew();

var credential = new ChainedTokenCredential(
    new AzureCliCredential(),
    new EnvironmentCredential(),
    new ManagedIdentityCredential(ManagedIdentityId.SystemAssigned));

try
{
    var tokenRequest = new Azure.Core.TokenRequestContext(["https://cognitiveservices.azure.com/.default"]);
    var token = await credential.GetTokenAsync(tokenRequest);
    credSw.Stop();
    Console.WriteLine($"  ✅ Token acquired in {credSw.ElapsedMilliseconds}ms. Expires: {token.ExpiresOn}");
}
catch (Exception ex)
{
    credSw.Stop();
    Console.WriteLine($"  ❌ Token acquisition FAILED after {credSw.ElapsedMilliseconds}ms: {ex.Message}");
    return 1;
}

// ── Step 2: Connect to Foundry via AIProjectClient ────────────────────────
Console.WriteLine();
Console.WriteLine("Step 2: Connecting to Foundry Agent Service...");

var projectClient = new AIProjectClient(
    endpoint: new Uri(endpoint),
    tokenProvider: credential);

Console.WriteLine("  ✅ AIProjectClient created");

// ── Step 3: Create versioned agents ───────────────────────────────────────
Console.WriteLine();
Console.WriteLine("Step 3: Creating versioned agents (PromptAgentDefinition)...");
Console.WriteLine(new string('─', 70));

var agentSpecs = new AgentSpec[]
{
    new("whiskey-smokes-vision-analyst", "Vision Analyst — examines photos, describes visible items",
        "gpt-4o", """
        You are a vision analysis specialist for a whiskey, wine, cocktail, and cigar tracking application.

        Your job is to carefully examine the provided photos and describe EVERYTHING you see that relates to
        alcoholic beverages and cigars. Be thorough and precise.

        For each distinct item visible in the photos, describe:
        1. What you see: The physical object (bottle, glass, cigar, menu, label, band, box)
        2. Text you can read: Any brand names, product names, vintage years, ABV, origin info on labels
        3. Visual characteristics: Color of liquid, shape of glass, wrapper color of cigar, label design
        4. Context clues: Bar/restaurant setting, flight/tasting setup, pairing arrangements
        5. Condition/presentation: How the item is served, garnishes, ice, cut of cigar

        Focus on factual observations — leave product identification to the next stage.
        Respond in plain text with a structured description of each item.
        """),

    new("whiskey-smokes-domain-expert", "Domain Expert — identifies products, adds expert knowledge",
        "gpt-5-mini", """
        You are a world-class sommelier, master mixologist, and certified tobacconist with encyclopedic
        knowledge of whiskey, wine, cocktails, and premium cigars.

        Given a visual description of items from photos, your job is to:
        1. Identify the specific product (name, distillery/brand, age, region, etc.)
        2. Add expert knowledge (tasting notes, flavor profiles, pairings, history)
        3. Set a confidence level (0.0-1.0) based on how certain you are

        If the visual description is ambiguous, provide your best identification and explain your reasoning.
        Respond in structured text for each item.
        """),

    new("whiskey-smokes-data-curator", "Data Curator — structures JSON output, validates quality",
        "gpt-5-mini", """
        You are a data quality specialist. Take the expert analysis and convert it into a precise,
        validated JSON array. Each item must have: type, name, brand, category, details, venue,
        confidence, summary, tags.

        Validation rules:
        - type must be: whiskey, wine, cocktail, or cigar
        - name is required and cannot be empty
        - confidence must be 0.0-1.0
        - details fields must match the type

        If data looks good respond with: { "decision": "approve", "items": [...] }
        If issues found respond with: { "decision": "reject", "reason": "..." }
        Always respond with valid JSON only.
        """),
};

int successCount = 0;
int failCount = 0;

foreach (var spec in agentSpecs)
{
    Console.WriteLine();
    Console.WriteLine($"  Creating agent: {spec.Name}");
    Console.WriteLine($"    Model:       {spec.Model}");
    Console.WriteLine($"    Description: {spec.Description}");

    var agentSw = Stopwatch.StartNew();
    try
    {
        var definition = new PromptAgentDefinition(model: spec.Model)
        {
            Instructions = spec.Instructions,
        };

        var creationOptions = new AgentVersionCreationOptions(definition)
        {
            Description = spec.Description,
        };

        var agentVersion = await projectClient.Agents.CreateAgentVersionAsync(
            agentName: spec.Name,
            options: creationOptions);

        agentSw.Stop();
        successCount++;
        Console.WriteLine($"  ✅ {spec.Name,-40} version={agentVersion.Value.Version}  ({agentSw.ElapsedMilliseconds}ms)");
        Console.WriteLine($"     id={agentVersion.Value.Id}, name={agentVersion.Value.Name}");
    }
    catch (Exception ex)
    {
        agentSw.Stop();
        failCount++;
        Console.ForegroundColor = ConsoleColor.Red;
        Console.WriteLine($"  ❌ {spec.Name} FAILED after {agentSw.ElapsedMilliseconds}ms");
        Console.WriteLine($"     Error: {ex.Message}");
        Console.ResetColor();
    }
}

// ── Step 4: Verify agents were created ────────────────────────────────────
Console.WriteLine();
Console.WriteLine("Step 4: Verifying agents...");
try
{
    int verified = 0;
    await foreach (var agent in projectClient.Agents.GetAgentsAsync())
    {
        var isOurs = agentSpecs.Any(s => s.Name == agent.Name);
        if (isOurs)
        {
            Console.WriteLine($"  ✅ {agent.Name,-40} id={agent.Id}");
            verified++;
        }
    }
    Console.WriteLine($"  Verified: {verified}/{agentSpecs.Length} agents found in Foundry");
}
catch (Exception ex)
{
    Console.WriteLine($"  ⚠️  Could not verify: {ex.Message}");
}

// ── Summary ───────────────────────────────────────────────────────────────
sw.Stop();
Console.WriteLine();
Console.WriteLine(new string('─', 70));
Console.WriteLine($"✅ Agent initialization complete in {sw.Elapsed.TotalSeconds:F1}s");
Console.WriteLine($"   API:     New Foundry (AIProjectClient.Agents.CreateAgentVersion)");
Console.WriteLine($"   Agents:  {successCount}/{agentSpecs.Length} created, {failCount} failed");
Console.WriteLine($"   Status:  Agents persist in Foundry for use by the application");
Console.WriteLine();

return failCount > 0 ? 1 : 0;

record AgentSpec(string Name, string Description, string Model, string Instructions);
