var builder = DistributedApplication.CreateBuilder(args);

var api = builder.AddProject<Projects.SipPuff_Api>("api")
    .WithExternalHttpEndpoints();

builder.Build().Run();
