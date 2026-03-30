var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.WhiskeyAndSmokes_Api>("api")
    .WithExternalHttpEndpoints()
    .WithEnvironment("AiFoundry__Endpoint", builder.Configuration["AiFoundry:Endpoint"] ?? "")
    .WithEnvironment("AiFoundry__ProjectEndpoint", builder.Configuration["AiFoundry:ProjectEndpoint"] ?? "")
    .WithEnvironment("AiFoundry__Models__Vision", builder.Configuration["AiFoundry:Models:Vision"] ?? "gpt-4o")
    .WithEnvironment("AiFoundry__Models__Reasoning", builder.Configuration["AiFoundry:Models:Reasoning"] ?? "gpt-5-mini")
    .WithEnvironment("APPLICATIONINSIGHTS_CONNECTION_STRING",
        builder.Configuration["APPLICATIONINSIGHTS_CONNECTION_STRING"] ?? "");

builder.Build().Run();
