using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.IdentityModel.Tokens;
using SipPuff.Api.Models;

namespace SipPuff.Api.Services;

public interface IAuthService
{
    string HashPassword(string password);
    bool VerifyPassword(string password, string hash);
    AuthResponse GenerateToken(User user);
    Task<User?> FindByEmailAsync(string email);
}

public class AuthService : IAuthService
{
    private readonly ICosmosDbService _cosmosDb;
    private readonly IConfiguration _config;
    private const string ContainerName = "users";

    public AuthService(ICosmosDbService cosmosDb, IConfiguration config)
    {
        _cosmosDb = cosmosDb;
        _config = config;
    }

    public string HashPassword(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, workFactor: 12);

    public bool VerifyPassword(string password, string hash) =>
        BCrypt.Net.BCrypt.Verify(password, hash);

    public AuthResponse GenerateToken(User user)
    {
        var key = new SymmetricSecurityKey(
            Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? throw new InvalidOperationException("JWT secret not configured")));

        var expiresAt = DateTime.UtcNow.AddDays(
            int.TryParse(_config["Jwt:ExpirationDays"], out var days) ? days : 7);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim(ClaimTypes.Name, user.DisplayName),
            new Claim(ClaimTypes.Role, user.Role),
        };

        var token = new JwtSecurityToken(
            issuer: _config["Jwt:Issuer"] ?? "sippuff",
            audience: _config["Jwt:Audience"] ?? "sippuff",
            claims: claims,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return new AuthResponse
        {
            Token = new JwtSecurityTokenHandler().WriteToken(token),
            ExpiresAt = expiresAt,
            User = user
        };
    }

    public async Task<User?> FindByEmailAsync(string email)
    {
        var users = await _cosmosDb.QueryCrossPartitionAsync<User>(
            ContainerName,
            $"SELECT * FROM c WHERE c.email = '{email.Replace("'", "''")}'",
            maxItems: 1);
        return users.FirstOrDefault();
    }
}
