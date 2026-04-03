using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using NSubstitute;
using WhiskeyAndSmokes.Api.Models;
using Xunit;

namespace WhiskeyAndSmokes.Tests.Controllers;

public class ValidationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public ValidationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        // Authenticated by default via TestAuthHandler
    }

    // --- Captures Controller Validation ---

    [Fact]
    public async Task CreateCapture_WithEmptyPhotos_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/captures", new
        {
            photos = Array.Empty<string>()
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCapture_WithNullPhotos_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/captures", new
        {
            userNote = "A note"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCapture_WithTooManyPhotos_Returns400()
    {
        var photos = Enumerable.Range(1, 11).Select(i => $"https://blob.example.com/photo{i}.jpg").ToList();

        var response = await _client.PostAsJsonAsync("/api/captures", new
        {
            photos
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCapture_WithUserNoteTooLong_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/captures", new
        {
            photos = new[] { "https://blob.example.com/photo1.jpg" },
            userNote = new string('a', 1001)
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateCapture_WithValidData_Returns201()
    {
        _factory.CosmosDb.CreateAsync("captures", Arg.Any<Capture>(), Arg.Any<string>())
            .Returns(callInfo =>
            {
                var capture = callInfo.ArgAt<Capture>(1);
                capture.Id = "test-capture-id";
                return capture;
            });

        var response = await _client.PostAsJsonAsync("/api/captures", new
        {
            photos = new[] { "https://blob.example.com/photo1.jpg" },
            userNote = "Nice bourbon"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Created);
    }

    // --- Items Controller Validation ---

    [Fact]
    public async Task UpdateItem_WithNameTooLong_Returns400()
    {
        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            name = new string('a', 201)
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateItem_WithBrandTooLong_Returns400()
    {
        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            brand = new string('b', 201)
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateItem_WithNotesTooLong_Returns400()
    {
        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            userNotes = new string('n', 2001)
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateItem_WithRatingOutOfRange_Returns400()
    {
        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            userRating = 6.0
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateItem_WithNegativeRating_Returns400()
    {
        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            userRating = -1.0
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateItem_WithTooManyTags_Returns400()
    {
        var tags = Enumerable.Range(1, 21).Select(i => $"tag{i}").ToList();

        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            tags
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task UpdateItem_WithValidData_Returns200()
    {
        var existingItem = new Item
        {
            Id = "item-1",
            UserId = CustomWebApplicationFactory.TestUserId,
            Name = "Old Name",
            Type = "whiskey",
            Status = "active",
            ProcessedBy = "ai"
        };

        _factory.CosmosDb.GetAsync<Item>("items", "item-1", CustomWebApplicationFactory.TestUserId)
            .Returns(Task.FromResult<Item?>(existingItem));
        _factory.CosmosDb.UpsertAsync("items", Arg.Any<Item>(), Arg.Any<string>())
            .Returns(callInfo => callInfo.ArgAt<Item>(1));

        var response = await _client.PutAsJsonAsync("/api/items/item-1", new
        {
            name = "New Name",
            userRating = 4.5
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
    }

    // --- Wishlist Validation ---

    [Fact]
    public async Task CreateWishlist_WithMissingName_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/items/wishlist", new
        {
            type = "whiskey"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateWishlist_WithMissingType_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/items/wishlist", new
        {
            name = "Test Whiskey"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    // --- Auth Endpoint Validation (cross-controller) ---

    [Fact]
    public async Task Login_WithEmailTooLong_Returns400()
    {
        var anonymousClient = _factory.CreateClient();
        anonymousClient.DefaultRequestHeaders.Add("X-Test-Anonymous", "true");

        var response = await anonymousClient.PostAsJsonAsync("/api/auth/login", new
        {
            email = new string('a', 250) + "@example.com",
            password = "ValidPass123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithPasswordTooLong_Returns400()
    {
        var anonymousClient = _factory.CreateClient();
        anonymousClient.DefaultRequestHeaders.Add("X-Test-Anonymous", "true");

        var response = await anonymousClient.PostAsJsonAsync("/api/auth/register", new
        {
            email = "test@example.com",
            password = new string('p', 129),
            displayName = "Test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
