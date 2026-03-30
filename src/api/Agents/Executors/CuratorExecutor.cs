using System.Text.Json;
using Microsoft.Agents.AI.Workflows;
using Microsoft.Extensions.AI;
using WhiskeyAndSmokes.Api.Agents.Models;
using WhiskeyAndSmokes.Api.Models;
using WhiskeyAndSmokes.Api.Services;

namespace WhiskeyAndSmokes.Api.Agents.Executors;

/// <summary>
/// Structures expert analysis into validated JSON. Approves or rejects with feedback.
/// Tracks refinement iterations and auto-approves after max attempts.
/// </summary>
internal sealed class CuratorExecutor : Executor<ExpertAnalysis, CuratorDecision>
{
    private readonly IChatClient _chatClient;
    private readonly IPromptService _promptService;
    private readonly ILogger _logger;
    private const int MaxRefinements = 2;

    public CuratorExecutor(
        IChatClient chatClient,
        IPromptService promptService,
        ILogger logger)
        : base("DataCurator")
    {
        _chatClient = chatClient;
        _promptService = promptService;
        _logger = logger;
    }

    public override async ValueTask<CuratorDecision> HandleAsync(
        ExpertAnalysis input,
        IWorkflowContext context,
        CancellationToken cancellationToken = default)
    {
        using var activity = Diagnostics.Agent.StartActivity("CuratorExecutor.Handle");
        activity?.SetTag("capture.id", input.CaptureId);
        activity?.SetTag("refinement.count", input.RefinementCount);

        _logger.LogInformation(
            "CuratorExecutor processing capture {CaptureId}: analysisLength={AnalysisLength}, refinementCount={Count}",
            input.CaptureId, input.Analysis.Length, input.RefinementCount);

        var prompt = await _promptService.GetAsync(PromptIds.DataCurator);
        var systemPrompt = prompt?.Content ?? DefaultPrompts.DataCurator;

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, systemPrompt),
            new(ChatRole.User, $"Expert analysis to structure:\n\n{input.Analysis}")
        };

        _logger.LogDebug("Sending curator request for capture {CaptureId}", input.CaptureId);

        var response = await _chatClient.GetResponseAsync(messages, cancellationToken: cancellationToken);
        var responseText = response.Text ?? "";

        _logger.LogDebug("Curator response for capture {CaptureId}: length={Length}, preview={Preview}",
            input.CaptureId, responseText.Length,
            responseText.Length > 200 ? responseText[..200] + "..." : responseText);

        var decision = ParseCuratorResponse(responseText, input.CaptureId);

        // Auto-approve if we've hit the max refinement count
        if (!decision.IsApproved && input.RefinementCount >= MaxRefinements)
        {
            _logger.LogWarning(
                "Max refinements ({MaxRefinements}) reached for capture {CaptureId} — auto-approving with best-effort data",
                MaxRefinements, input.CaptureId);

            // Try to extract items from the expert analysis directly
            decision = new CuratorDecision
            {
                Decision = "approve",
                Items = decision.Items ?? ExtractBestEffortItems(responseText)
            };
        }

        activity?.SetTag("curator.decision", decision.Decision);
        activity?.SetTag("curator.item_count", decision.Items?.Count ?? 0);

        _logger.LogInformation(
            "CuratorExecutor decision for capture {CaptureId}: {Decision}, items={ItemCount}",
            input.CaptureId, decision.Decision, decision.Items?.Count ?? 0);

        return decision;
    }

    private CuratorDecision ParseCuratorResponse(string responseText, string captureId)
    {
        try
        {
            var jsonText = responseText.Trim();

            // Strip markdown code fences if present
            if (jsonText.StartsWith("```"))
            {
                var firstNewline = jsonText.IndexOf('\n');
                var lastFence = jsonText.LastIndexOf("```");
                if (firstNewline > 0 && lastFence > firstNewline)
                {
                    jsonText = jsonText[(firstNewline + 1)..lastFence].Trim();
                }
            }

            var decision = JsonSerializer.Deserialize<CuratorDecision>(jsonText, new JsonSerializerOptions
            {
                PropertyNameCaseInsensitive = true
            });

            if (decision != null)
            {
                return decision;
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to parse curator JSON for capture {CaptureId}: {Error}", captureId, ex.Message);
        }

        // If we couldn't parse the response, try to extract a JSON array directly
        return new CuratorDecision
        {
            Decision = "approve",
            Items = ExtractBestEffortItems(responseText)
        };
    }

    private List<CuratorItemResult>? ExtractBestEffortItems(string text)
    {
        try
        {
            var arrayStart = text.IndexOf('[');
            var arrayEnd = text.LastIndexOf(']');
            if (arrayStart >= 0 && arrayEnd > arrayStart)
            {
                var arrayJson = text[arrayStart..(arrayEnd + 1)];
                return JsonSerializer.Deserialize<List<CuratorItemResult>>(arrayJson, new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true
                });
            }
        }
        catch (JsonException ex)
        {
            _logger.LogWarning(ex, "Failed to extract best-effort items from curator response");
        }

        return null;
    }
}
