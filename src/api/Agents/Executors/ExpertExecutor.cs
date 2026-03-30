using Microsoft.Agents.AI.Workflows;
using Microsoft.Extensions.AI;
using WhiskeyAndSmokes.Api.Agents.Models;
using WhiskeyAndSmokes.Api.Models;
using WhiskeyAndSmokes.Api.Services;

namespace WhiskeyAndSmokes.Api.Agents.Executors;

/// <summary>
/// Identifies specific products from visual descriptions and adds expert knowledge.
/// Handles both initial analysis (from VisionDescription) and refinement (from CuratorDecision).
/// </summary>
internal sealed class ExpertExecutor : Executor
{
    private readonly IChatClient _chatClient;
    private readonly IPromptService _promptService;
    private readonly ILogger _logger;
    private string? _visionContext;
    private int _refinementCount;

    public ExpertExecutor(
        IChatClient chatClient,
        IPromptService promptService,
        ILogger logger)
        : base("DomainExpert")
    {
        _chatClient = chatClient;
        _promptService = promptService;
        _logger = logger;
    }

    protected override ProtocolBuilder ConfigureProtocol(ProtocolBuilder protocol)
    {
        protocol.ConfigureRoutes(routes =>
        {
            routes.AddHandler<VisionDescription, ExpertAnalysis>(HandleVisionAsync);
            routes.AddHandler<CuratorDecision, ExpertAnalysis>(HandleRejectionAsync);
        });
        return protocol;
    }

    /// <summary>Initial analysis from the Vision Analyst.</summary>
    private async ValueTask<ExpertAnalysis> HandleVisionAsync(
        VisionDescription vision,
        IWorkflowContext context,
        CancellationToken cancellationToken)
    {
        using var activity = Diagnostics.Agent.StartActivity("ExpertExecutor.HandleVision");
        activity?.SetTag("capture.id", vision.CaptureId);

        _logger.LogInformation(
            "ExpertExecutor initial analysis for capture {CaptureId}: descriptionLength={DescLength}",
            vision.CaptureId, vision.Description.Length);

        _visionContext = vision.Description;
        _refinementCount = 0;

        var userMessage = $"""
            Here is what the vision analyst observed in the photos:

            {vision.Description}

            {(vision.UserNote != null ? $"User's note: {vision.UserNote}" : "")}
            {(vision.Location != null ? $"GPS Location: {vision.Location.Latitude}, {vision.Location.Longitude}" : "")}

            Please identify each item and provide your expert analysis.
            """;

        var analysis = await CallExpertAsync(vision.CaptureId, userMessage, cancellationToken);

        return new ExpertAnalysis
        {
            CaptureId = vision.CaptureId,
            Analysis = analysis,
            RefinementCount = _refinementCount
        };
    }

    /// <summary>Refinement pass when the Curator rejects with feedback.</summary>
    private async ValueTask<ExpertAnalysis> HandleRejectionAsync(
        CuratorDecision rejection,
        IWorkflowContext context,
        CancellationToken cancellationToken)
    {
        using var activity = Diagnostics.Agent.StartActivity("ExpertExecutor.HandleRejection");
        _refinementCount++;

        _logger.LogInformation(
            "ExpertExecutor refinement #{RefinementCount}: reason={Reason}",
            _refinementCount, rejection.Reason);

        var userMessage = $"""
            The data curator rejected your previous analysis with this feedback:
            {rejection.Reason}

            Original vision description for reference:
            {_visionContext}

            Please refine your analysis addressing the curator's feedback.
            """;

        var captureId = rejection.Items?.FirstOrDefault()?.Name ?? "unknown";
        var analysis = await CallExpertAsync(captureId, userMessage, cancellationToken);

        return new ExpertAnalysis
        {
            CaptureId = captureId,
            Analysis = analysis,
            RefinementCount = _refinementCount
        };
    }

    private async Task<string> CallExpertAsync(string captureId, string userMessage, CancellationToken cancellationToken)
    {
        var prompt = await _promptService.GetAsync(PromptIds.DomainExpert);
        var systemPrompt = prompt?.Content ?? DefaultPrompts.DomainExpert;

        var messages = new List<ChatMessage>
        {
            new(ChatRole.System, systemPrompt),
            new(ChatRole.User, userMessage)
        };

        _logger.LogDebug("Sending expert request for capture {CaptureId}: messageLength={MessageLength}",
            captureId, userMessage.Length);

        var response = await _chatClient.GetResponseAsync(messages, cancellationToken: cancellationToken);
        var result = response.Text ?? "";

        _logger.LogDebug("Expert response for capture {CaptureId}: length={ResponseLength}",
            captureId, result.Length);

        return result;
    }
}
