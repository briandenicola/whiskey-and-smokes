using Azure.Storage.Blobs;
using Azure.Storage.Sas;

namespace SipPuff.Api.Services;

public interface IBlobStorageService
{
    Task<(string UploadUrl, string BlobUrl)> GenerateUploadUrlAsync(string userId, string fileName);
    Task DeleteBlobAsync(string blobUrl);
}

public class BlobStorageService : IBlobStorageService
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;

    public BlobStorageService(BlobServiceClient blobServiceClient, IConfiguration config)
    {
        _blobServiceClient = blobServiceClient;
        _containerName = config["BlobStorage:ContainerName"] ?? "captures";
    }

    public async Task<(string UploadUrl, string BlobUrl)> GenerateUploadUrlAsync(string userId, string fileName)
    {
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        await containerClient.CreateIfNotExistsAsync();

        var blobName = $"{userId}/{DateTime.UtcNow:yyyy/MM/dd}/{Guid.NewGuid()}{Path.GetExtension(fileName)}";
        var blobClient = containerClient.GetBlobClient(blobName);

        // Generate user delegation SAS
        var userDelegationKey = await _blobServiceClient.GetUserDelegationKeyAsync(
            DateTimeOffset.UtcNow.AddMinutes(-5),
            DateTimeOffset.UtcNow.AddMinutes(30));

        var sasBuilder = new BlobSasBuilder
        {
            BlobContainerName = _containerName,
            BlobName = blobName,
            Resource = "b",
            StartsOn = DateTimeOffset.UtcNow.AddMinutes(-5),
            ExpiresOn = DateTimeOffset.UtcNow.AddMinutes(30)
        };
        sasBuilder.SetPermissions(BlobSasPermissions.Write | BlobSasPermissions.Create);

        var sasToken = sasBuilder.ToSasQueryParameters(userDelegationKey, _blobServiceClient.AccountName);
        var uploadUrl = $"{blobClient.Uri}?{sasToken}";

        return (uploadUrl, blobClient.Uri.ToString());
    }

    public async Task DeleteBlobAsync(string blobUrl)
    {
        var uri = new Uri(blobUrl);
        var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
        var blobName = string.Join("/", uri.Segments.Skip(2)).TrimStart('/');
        await containerClient.DeleteBlobIfExistsAsync(blobName);
    }
}
