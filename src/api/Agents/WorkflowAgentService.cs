using System.Diagnostics;
using System.Text.Json;
using Azure.AI.OpenAI;
using Azure.Identity;
using Microsoft.Extensions.AI;
using WhiskeyAndSmokes.Api.Agents.Executors;
using WhiskeyAndSmokes.Api.Agents.Models;
using WhiskeyAndSmokes.Api.Models;
using WhiskeyAndSmokes.Api.Services;

namespace WhiskeyAndSmokes.Api.Agents;

/// <summary>
/// IAgentService implementation that runs the multi-agent pipeline with per-step tracking.
/// Each agent's output is persisted as a WorkflowStep on the Capture for audit/display.
/// Falls back to local keyword extraction when AI Foundry is not configured.
/// </summary>
public class WorkflowAgentService : IAgentService
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IPromptService _promptService;
    private readonly IBlobStorageService _blobService;
    private readonly ILogger<WorkflowAgentService> _logger;
    private readonly IConfiguration _config;
    private readonly ILoggerFactory _loggerFactory;
    private readonly bool _isFoundryConfigured;

    private const int MaxRefinements = 2;

    public WorkflowAgentService(
        ICosmosDbService cosmosDb,
        IPromptService promptService,
        IBlobStorageService blobService,
        ILogger<WorkflowAgentService> logger,
        IConfiguration config,
        ILoggerFactory loggerFactory)
    {
        _cosmosDb = cosmosDb;
        _promptService = promptService;
        _blobService = blobService;
        _logger = logger;
        _config = config;
        _loggerFactory = loggerFactory;
        _isFoundryConfigured = !string.IsNullOrEmpty(config["AiFoundry:Endpoint"]);
    }

    public async Task ProcessCaptureAsync(Capture capture)
    {
        using var activity = Diagnostics.Agent.StartActivity("ProcessCapture");
        activity?.SetTag("capture.id", capture.Id);
        activity?.SetTag("capture.user_id", capture.UserId);
        activity?.SetTag("capture.photo_count", capture.Photos.Count);

        _logger.LogInformation(
            "Processing capture {CaptureId} for user {UserId} with {PhotoCount} photos, noteLength={NoteLength}",
            capture.Id, capture.UserId, capture.Photos.Count, capture.UserNote?.Length ?? 0);

        try
        {
            capture.Status = CaptureStatus.Processing;
            capture.WorkflowSteps = [];
            capture.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);

            List<Item> items;

            if (_isFoundryConfigured)
            {
                _logger.LogInformation("Running multi-agent workflow for capture {CaptureId}", capture.Id);
                items = await RunWorkflowAsync(capture);
            }
            else
            {
                _logger.LogWarning("AI Foundry not configured — using local extraction for capture {CaptureId}", capture.Id);
                await LogStep(capture, "S01", "Local Extraction", WorkflowStepStatus.Running, "AI Foundry not configured — using keyword matching");
                items = LocalExtraction.Process(capture, _logger);
                await LogStep(capture, "S01", "Local Extraction", WorkflowStepStatus.Complete,
                    $"Extracted {items.Count} item(s) from note keywords");
            }

            activity?.SetTag("items.count", items.Count);

            foreach (var item in items)
            {
                await _cosmosDb.CreateAsync("items", item, item.PartitionKey);
                capture.ItemIds.Add(item.Id);
            }

            capture.Status = CaptureStatus.Completed;
            capture.UpdatedAt = DateTime.UtcNow;
            await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);

            _logger.LogInformation(
                "Capture {CaptureId} completed: {ItemCount} items, types=[{Types}]",
                capture.Id, items.Count, string.Join(", ", items.Select(i => i.Type).Distinct()));
        }
        catch (Exception ex)
        {
            activity?.SetStatus(ActivityStatusCode.Error, ex.Message);
            _logger.LogError(ex, "Failed to process capture {CaptureId}: {Error}", capture.Id, ex.Message);

            await LogStep(capture, "ERR", "Error", WorkflowStepStatus.Error, ex.Message);

            try
            {
                _logger.LogWarning("Attempting local extraction fallback for capture {CaptureId}", capture.Id);
                var fallbackItems = LocalExtraction.Process(capture, _logger);

                foreach (var item in fallbackItems)
                {
                    await _cosmosDb.CreateAsync("items", item, item.PartitionKey);
                    capture.ItemIds.Add(item.Id);
                }

                capture.Status = CaptureStatus.Completed;
                capture.ProcessingError = $"AI workflow failed ({ex.Message}), used local extraction";
                capture.UpdatedAt = DateTime.UtcNow;
                await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);
            }
            catch (Exception fallbackEx)
            {
                _logger.LogError(fallbackEx, "Local extraction fallback also failed for capture {CaptureId}", capture.Id);
                capture.Status = CaptureStatus.Failed;
                capture.ProcessingError = ex.Message;
                capture.UpdatedAt = DateTime.UtcNow;
                await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);
            }
        }
    }

    private async Task<List<Item>> RunWorkflowAsync(Capture capture)
    {
        using var activity = Diagnostics.Agent.StartActivity("RunWorkflow");
        activity?.SetTag("capture.id", capture.Id);

        var endpoint = _config["AiFoundry:Endpoint"]
            ?? throw new InvalidOperationException("AiFoundry:Endpoint is required");

        var azureClient = new AzureOpenAIClient(new Uri(endpoint), new DefaultAzureCredential());

        var visionModel = _config["AiFoundry:Models:Vision"] ?? "gpt-4o";
        var reasoningModel = _config["AiFoundry:Models:Reasoning"] ?? "gpt-5-mini";

        IChatClient visionChatClient = azureClient.GetChatClient(visionModel).AsIChatClient();
        IChatClient reasoningChatClient = azureClient.GetChatClient(reasoningModel).AsIChatClient();

        var input = new CaptureInput
        {
            CaptureId = capture.Id,
            UserId = capture.UserId,
            PhotoUrls = capture.Photos,
            UserNote = capture.UserNote,
            Location = capture.Location != null
                ? new GeoCoordinate { Latitude = capture.Location.Latitude, Longitude = capture.Location.Longitude }
                : null
        };

        // ── Step 1: Vision Analyst ────────────────────────────────────────
        await LogStep(capture, "S01", "Vision Analyst", WorkflowStepStatus.Running,
            $"Analyzing {capture.Photos.Count} photo(s) with {visionModel}...");

        var vision = new VisionExecutor(
            visionChatClient, _promptService, _blobService,
            _loggerFactory.CreateLogger<VisionExecutor>());

        var visionResult = await vision.HandleAsync(input, null!, CancellationToken.None);

        var visionSummary = visionResult.Description.Length > 300
            ? visionResult.Description[..300] + "..."
            : visionResult.Description;
        await LogStep(capture, "S01", "Vision Analyst", WorkflowStepStatus.Complete,
            visionSummary, visionResult.Description);

        // ── Step 2: Domain Expert ─────────────────────────────────────────
        await LogStep(capture, "S02", "Domain Expert", WorkflowStepStatus.Running,
            $"Identifying products with {reasoningModel}...");

        var expert = new ExpertExecutor(
            reasoningChatClient, _promptService,
            _loggerFactory.CreateLogger<ExpertExecutor>());

        var expertResult = await expert.AnalyzeAsync(visionResult);

        var expertSummary = expertResult.Analysis.Length > 300
            ? expertResult.Analysis[..300] + "..."
            : expertResult.Analysis;
        await LogStep(capture, "S02", "Domain Expert", WorkflowStepStatus.Complete,
            expertSummary, expertResult.Analysis);

        // ── Step 3: Data Curator (with retry loop) ────────────────────────
        CuratorDecision? decision = null;
        var refinements = 0;

        while (refinements <= MaxRefinements)
        {
            var stepLabel = refinements == 0 ? "Data Curator" : $"Data Curator (refinement #{refinements})";
            await LogStep(capture, "S03", stepLabel, WorkflowStepStatus.Running,
                refinements == 0
                    ? $"Structuring results with {reasoningModel}..."
                    : "Refining based on curator feedback...");

            var curator = new CuratorExecutor(
                reasoningChatClient, _promptService,
                _loggerFactory.CreateLogger<CuratorExecutor>());

            decision = await curator.HandleAsync(expertResult, null!, CancellationToken.None);

            if (decision.IsApproved)
            {
                var itemNames = decision.Items?.Select(i => i.Name).ToList() ?? [];
                await LogStep(capture, "S03", stepLabel, WorkflowStepStatus.Complete,
                    $"Approved {decision.Items?.Count ?? 0} item(s): {string.Join(", ", itemNames)}",
                    JsonSerializer.Serialize(decision.Items, new JsonSerializerOptions { WriteIndented = true }));
                break;
            }

            // Rejected — feed back to expert
            await LogStep(capture, "S03", stepLabel, WorkflowStepStatus.Complete,
                $"Rejected: {decision.Reason}");

            refinements++;
            if (refinements > MaxRefinements)
            {
                _logger.LogWarning("Max refinements reached for capture {CaptureId} — auto-approving", capture.Id);
                decision = new CuratorDecision { Decision = "approve", Items = decision.Items ?? [] };
                await LogStep(capture, "S03", "Data Curator", WorkflowStepStatus.Complete,
                    "Max refinements reached — auto-approved");
                break;
            }

            // Re-run expert with rejection feedback
            await LogStep(capture, "S02", $"Domain Expert (revision #{refinements})", WorkflowStepStatus.Running,
                $"Revising based on feedback: {decision.Reason}");

            expertResult = await expert.RefineAsync(visionResult, decision);
            await LogStep(capture, "S02", $"Domain Expert (revision #{refinements})", WorkflowStepStatus.Complete,
                expertResult.Analysis.Length > 300 ? expertResult.Analysis[..300] + "..." : expertResult.Analysis);
        }

        if (decision?.IsApproved == true && decision.Items != null && decision.Items.Count > 0)
        {
            return ConvertToItems(decision.Items, capture);
        }

        _logger.LogWarning("Workflow did not produce approved items for capture {CaptureId} — falling back", capture.Id);
        await LogStep(capture, "S04", "Fallback", WorkflowStepStatus.Complete,
            "AI workflow produced no items — used local keyword extraction");
        return LocalExtraction.Process(capture, _logger);
    }

    private async Task LogStep(Capture capture, string stepId, string agentName, string status,
        string summary, string? detail = null)
    {
        capture.WorkflowSteps.Add(new WorkflowStep
        {
            StepId = stepId,
            AgentName = agentName,
            Status = status,
            Summary = summary,
            Detail = detail,
            Timestamp = DateTime.UtcNow
        });
        capture.UpdatedAt = DateTime.UtcNow;

        try
        {
            await _cosmosDb.UpsertAsync("captures", capture, capture.PartitionKey);
        }
        catch (Exception ex)
        {
            _logger.LogWarning(ex, "Failed to persist workflow step {StepId} for capture {CaptureId}", stepId, capture.Id);
        }
    }

    private static List<Item> ConvertToItems(List<CuratorItemResult> curatorItems, Capture capture)
    {
        return curatorItems.Select(p => new Item
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
}
