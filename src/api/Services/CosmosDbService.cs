using Microsoft.Azure.Cosmos;
using Microsoft.Azure.Cosmos.Linq;
using System.Linq.Expressions;

namespace SipPuff.Api.Services;

public interface ICosmosDbService
{
    Task<T?> GetAsync<T>(string containerName, string id, string partitionKey);
    Task<T> CreateAsync<T>(string containerName, T item, string partitionKey);
    Task<T> UpsertAsync<T>(string containerName, T item, string partitionKey);
    Task DeleteAsync(string containerName, string id, string partitionKey);
    Task<(List<T> Items, string? ContinuationToken)> QueryAsync<T>(
        string containerName,
        string partitionKey,
        string? continuationToken = null,
        int maxItems = 25,
        Expression<Func<T, bool>>? predicate = null);
    Task<List<T>> QueryCrossPartitionAsync<T>(string containerName, string query, int maxItems = 100);
}

public class CosmosDbService : ICosmosDbService
{
    private readonly CosmosClient _client;
    private readonly Database _database;

    public CosmosDbService(CosmosClient client, IConfiguration config)
    {
        _client = client;
        _database = _client.GetDatabase(config["CosmosDb:DatabaseName"] ?? "sippuff");
    }

    public async Task<T?> GetAsync<T>(string containerName, string id, string partitionKey)
    {
        var container = _database.GetContainer(containerName);
        try
        {
            var response = await container.ReadItemAsync<T>(id, new PartitionKey(partitionKey));
            return response.Resource;
        }
        catch (CosmosException ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return default;
        }
    }

    public async Task<T> CreateAsync<T>(string containerName, T item, string partitionKey)
    {
        var container = _database.GetContainer(containerName);
        var response = await container.CreateItemAsync(item, new PartitionKey(partitionKey));
        return response.Resource;
    }

    public async Task<T> UpsertAsync<T>(string containerName, T item, string partitionKey)
    {
        var container = _database.GetContainer(containerName);
        var response = await container.UpsertItemAsync(item, new PartitionKey(partitionKey));
        return response.Resource;
    }

    public async Task DeleteAsync(string containerName, string id, string partitionKey)
    {
        var container = _database.GetContainer(containerName);
        await container.DeleteItemAsync<object>(id, new PartitionKey(partitionKey));
    }

    public async Task<(List<T> Items, string? ContinuationToken)> QueryAsync<T>(
        string containerName,
        string partitionKey,
        string? continuationToken = null,
        int maxItems = 25,
        Expression<Func<T, bool>>? predicate = null)
    {
        var container = _database.GetContainer(containerName);
        var queryable = container.GetItemLinqQueryable<T>(
            requestOptions: new QueryRequestOptions
            {
                PartitionKey = new PartitionKey(partitionKey),
                MaxItemCount = maxItems
            },
            continuationToken: continuationToken);

        if (predicate != null)
            queryable = (IOrderedQueryable<T>)queryable.Where(predicate);

        var iterator = queryable.ToFeedIterator();
        var results = new List<T>();
        string? nextToken = null;

        if (iterator.HasMoreResults)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
            nextToken = response.ContinuationToken;
        }

        return (results, nextToken);
    }

    public async Task<List<T>> QueryCrossPartitionAsync<T>(string containerName, string query, int maxItems = 100)
    {
        var container = _database.GetContainer(containerName);
        var queryDef = new QueryDefinition(query);
        var iterator = container.GetItemQueryIterator<T>(queryDef, requestOptions: new QueryRequestOptions { MaxItemCount = maxItems });
        var results = new List<T>();

        while (iterator.HasMoreResults && results.Count < maxItems)
        {
            var response = await iterator.ReadNextAsync();
            results.AddRange(response);
        }

        return results;
    }
}
