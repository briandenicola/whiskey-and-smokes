using WhiskeyAndSmokes.Api.Models;

namespace WhiskeyAndSmokes.Api.Services;

public interface IRecommendationService
{
    /// <summary>
    /// Get AI-powered recommendations based on user's rating history
    /// </summary>
    Task<RecommendationResponse> GetRecommendationsAsync(string userId, RecommendationRequest request, CancellationToken cancellationToken = default);

    /// <summary>
    /// Build a user's rating profile for recommendations
    /// </summary>
    Task<UserRatingProfile> BuildUserProfileAsync(string userId, CancellationToken cancellationToken = default);

    /// <summary>
    /// Extract menu items from a photo
    /// </summary>
    Task<List<string>> ExtractMenuItemsAsync(string photoUrl, CancellationToken cancellationToken = default);
}
