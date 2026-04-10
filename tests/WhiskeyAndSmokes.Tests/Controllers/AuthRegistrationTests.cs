using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using NSubstitute;
using WhiskeyAndSmokes.Api.Models;
using Xunit;

namespace WhiskeyAndSmokes.Tests.Controllers;

public class AuthRegistrationTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public AuthRegistrationTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-Anonymous", "true");
    }

    [Fact]
    public async Task Register_WithValidData_Returns200()
    {
        var createdUser = new User
        {
            Id = "new-user-1",
            Email = "newuser@example.com",
            DisplayName = "New User",
            Role = "user"
        };
        var authResponse = new AuthResponse
        {
            Token = "new-user-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = createdUser.Sanitized()
        };

        _factory.AuthService.FindByEmailAsync("newuser@example.com")
            .Returns(Task.FromResult<User?>(null));
        _factory.AuthService.HashPassword("ValidPass123")
            .Returns("hashed-password");
        _factory.CosmosDb.QueryCrossPartitionAsync<User>(
            "users", Arg.Any<string>(), Arg.Any<int>())
            .Returns(new List<User> { new() }); // not first user
        _factory.CosmosDb.CreateAsync("users", Arg.Any<User>(), Arg.Any<string>())
            .Returns(callInfo => callInfo.ArgAt<User>(1));
        _factory.AuthService.GenerateTokenWithRefreshAsync(Arg.Any<User>())
            .Returns(Task.FromResult(authResponse));

        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "newuser@example.com",
            password = "ValidPass123",
            displayName = "New User"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        body.Should().NotBeNull();
        body!.Token.Should().NotBeNullOrEmpty();
    }

    [Fact]
    public async Task Register_WithMissingEmail_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            password = "ValidPass123",
            displayName = "Test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithMissingPassword_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "test@example.com",
            displayName = "Test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithPasswordTooShort_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "test@example.com",
            password = "short",
            displayName = "Test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithInvalidEmailFormat_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "not-an-email",
            password = "ValidPass123",
            displayName = "Test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Register_WithDuplicateEmail_Returns409()
    {
        var existingUser = new User
        {
            Id = "existing",
            Email = "existing@example.com"
        };

        _factory.AuthService.FindByEmailAsync("existing@example.com")
            .Returns(Task.FromResult<User?>(existingUser));

        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "existing@example.com",
            password = "ValidPass123",
            displayName = "Test"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Conflict);
    }

    [Fact]
    public async Task Register_WithMissingDisplayName_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/register", new
        {
            email = "test@example.com",
            password = "ValidPass123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
