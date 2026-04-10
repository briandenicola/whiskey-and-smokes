using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using NSubstitute;
using WhiskeyAndSmokes.Api.Models;
using Xunit;

namespace WhiskeyAndSmokes.Tests.Controllers;

public class AuthControllerTests : IClassFixture<CustomWebApplicationFactory>
{
    private readonly HttpClient _client;
    private readonly CustomWebApplicationFactory _factory;

    public AuthControllerTests(CustomWebApplicationFactory factory)
    {
        _factory = factory;
        _client = factory.CreateClient();
        _client.DefaultRequestHeaders.Add("X-Test-Anonymous", "true");
    }

    [Fact]
    public async Task Login_WithValidCredentials_Returns200WithToken()
    {
        var testUser = new User
        {
            Id = "user-1",
            Email = "valid@example.com",
            PasswordHash = "hashed",
            DisplayName = "Test User",
            Role = "user"
        };
        var expectedResponse = new AuthResponse
        {
            Token = "test-jwt-token",
            ExpiresAt = DateTime.UtcNow.AddHours(1),
            User = testUser.Sanitized()
        };

        _factory.AuthService.FindByEmailAsync("valid@example.com")
            .Returns(Task.FromResult<User?>(testUser));
        _factory.AuthService.VerifyPassword("ValidPass123", testUser.PasswordHash)
            .Returns(true);
        _factory.AuthService.GenerateTokenWithRefreshAsync(testUser)
            .Returns(Task.FromResult(expectedResponse));

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "valid@example.com",
            password = "ValidPass123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.Content.ReadFromJsonAsync<AuthResponse>();
        body.Should().NotBeNull();
        body!.Token.Should().Be("test-jwt-token");
    }

    [Fact]
    public async Task Login_WithMissingEmail_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = (string?)null,
            password = "ValidPass123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithMissingPassword_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "test@example.com",
            password = (string?)null
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithInvalidEmailFormat_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "not-an-email",
            password = "ValidPass123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithWrongPassword_Returns401()
    {
        var testUser = new User
        {
            Id = "user-1",
            Email = "test@example.com",
            PasswordHash = "hashed",
            DisplayName = "Test User"
        };

        _factory.AuthService.FindByEmailAsync("test@example.com")
            .Returns(Task.FromResult<User?>(testUser));
        _factory.AuthService.VerifyPassword("WrongPassword1", testUser.PasswordHash)
            .Returns(false);

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "test@example.com",
            password = "WrongPassword1"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithEmptyBody_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new { });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithPasswordTooShort_Returns400()
    {
        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "test@example.com",
            password = "short"
        });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Login_WithDisabledAccount_Returns401()
    {
        var testUser = new User
        {
            Id = "user-1",
            Email = "disabled@example.com",
            PasswordHash = "hashed",
            DisplayName = "Disabled User",
            IsDisabled = true
        };

        _factory.AuthService.FindByEmailAsync("disabled@example.com")
            .Returns(Task.FromResult<User?>(testUser));
        _factory.AuthService.VerifyPassword("ValidPass123", testUser.PasswordHash)
            .Returns(true);

        var response = await _client.PostAsJsonAsync("/api/auth/login", new
        {
            email = "disabled@example.com",
            password = "ValidPass123"
        });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
