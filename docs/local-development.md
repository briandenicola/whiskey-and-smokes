# Local Development

The only Azure dependency for local development is **Azure AI Foundry** (for the multi-agent vision pipeline). All other services use local alternatives.

| Concern | Local | Production |
|---------|-------|------------|
| Database | LiteDB (file-based, zero config) | Azure CosmosDB |
| Blob Storage | Local filesystem (`uploads/`) | Azure Blob Storage |
| AI Vision | gpt-4o via Azure AI Foundry | gpt-4o via Azure AI Foundry |
| AI Reasoning | gpt-5-mini via Azure AI Foundry | gpt-5-mini via Azure AI Foundry |
| Observability | Aspire Dashboard (OTLP) | Azure Application Insights |
| Auth | JWT with dev secret | Azure Entra ID |

## Prerequisites

- [.NET 10 SDK](https://dotnet.microsoft.com/download)
- [Node.js 22+](https://nodejs.org/)
- [Docker & Docker Compose](https://docs.docker.com/get-docker/)
- [Task](https://taskfile.dev) (task runner)
- [Azure CLI](https://learn.microsoft.com/en-us/cli/azure/install-azure-cli)
- [Terraform](https://developer.hashicorp.com/terraform/install)
- An Azure subscription with permissions to create Cognitive Services resources

## Getting Started

### 1. Clone and install dependencies

```bash
git clone <repo-url> && cd whiskey-and-smokes
```

### 2. Sign in to Azure

Authentication uses your Azure CLI credentials via `DefaultAzureCredential`.

```bash
az login
```

### 3. Provision Azure AI Foundry

Creates a resource group, an Azure AI Foundry account, deploys **gpt-4o** (vision) and **gpt-5-mini** (reasoning) models, and grants your Azure user the **Cognitive Services OpenAI User** role.

```bash
task local:up
```

Verify the endpoint was created:

```bash
task local:output
```

### 4. Initialize Foundry Agents

Creates (or recreates) the three agents in your Foundry project with prompts from `src/AgentInitiator/Prompts/`:

```bash
task app:agent:init
```

### 5. Run the application

The API starts with LiteDB and local filesystem storage — no CosmosDB or Blob Storage emulators needed. AI Foundry and Application Insights endpoints are automatically injected from your Terraform state.

```bash
task app:run
```

This starts both the Aspire AppHost (API + OpenTelemetry dashboard) and the Vue dev server:

| Service | URL | Notes |
|---------|-----|-------|
| API | http://localhost:5062 | .NET 10, OpenAPI at `/openapi/v1.json` |
| Web | http://localhost:5173 | Vue 3 + Vite with hot reload |
| Aspire Dashboard | http://localhost:18888 | Traces, metrics, logs |

To run services individually:

```bash
task app:apphost  # API via Aspire (with dashboard)
task app:api      # API standalone (no Aspire)
task app:web      # Frontend only
```

### 6. Build

```bash
task app:build        # Full .NET solution + Vue frontend
task app:build:web    # Vue frontend only
```

### 7. Tear down Azure resources

When you're done, destroy the AI Foundry resources to avoid charges:

```bash
task local:down
```

## Available Tasks

Run `task --list` to see all tasks. Key ones for local dev:

### App Tasks (`task app:*`)

| Task | Description |
|------|-------------|
| `app:build` | Builds the full .NET solution and Vue frontend |
| `app:build:web` | Builds the Vue frontend only |
| `app:run` | Runs Aspire AppHost + Vue frontend |
| `app:apphost` | Runs the Aspire AppHost (API + dashboard) |
| `app:api` | Runs the .NET API standalone |
| `app:web` | Runs the Vue dev server |
| `app:agent:init` | Creates/recreates agents in AI Foundry |
| `app:services:up` | Starts Docker Compose services |
| `app:services:down` | Stops Docker Compose services |

### Local Infrastructure (`task local:*`)

| Task | Description |
|------|-------------|
| `local:up` | Provisions Azure AI Foundry for local dev |
| `local:apply` | Applies Terraform changes |
| `local:output` | Shows Terraform outputs (endpoint, App Insights) |
| `local:down` | Destroys local Azure resources |

## Observability

The application uses OpenTelemetry for distributed tracing, metrics, and structured logging.

### Exporters

| Exporter | Env Var | Purpose |
|----------|---------|---------|
| OTLP | `OTEL_EXPORTER_OTLP_ENDPOINT` | Aspire Dashboard (local dev) |
| Azure Monitor | `APPLICATIONINSIGHTS_CONNECTION_STRING` | Application Insights (optional locally) |

Both exporters can run simultaneously. The Aspire AppHost auto-configures OTLP. Application Insights is injected from Terraform when available.

### Custom Trace Sources

| Source | Purpose |
|--------|---------|
| `WhiskeyAndSmokes.Api` | General operations |
| `WhiskeyAndSmokes.Api.Auth` | Authentication & authorization |
| `WhiskeyAndSmokes.Api.Captures` | Photo capture workflow |
| `WhiskeyAndSmokes.Api.Agent` | AI agent interactions |
| `WhiskeyAndSmokes.Api.Workflow` | Multi-agent workflow orchestration |
| `WhiskeyAndSmokes.Api.Storage` | CosmosDB & blob storage |
| `WhiskeyAndSmokes.Api.Admin` | Admin operations |

### Runtime Log Levels

Log levels are configurable at runtime from the **Admin Panel → Logging** tab. Changes take effect immediately without restart and are persisted to the database.

## Troubleshooting

### SSL certificate errors connecting to Foundry

If you're behind a TLS-inspecting proxy (corporate network, Zscaler, etc.), you may see `UntrustedRoot` errors. The Taskfile sets `SSL_CERT_DIR=/etc/ssl/certs` to trust system-installed CAs. If that doesn't work:

1. Export your proxy's root CA as a `.crt` file
2. Copy it to `/usr/local/share/ca-certificates/`
3. Run `sudo update-ca-certificates`

### Aspire dashboard not accessible

The dashboard runs on port 18888. If running standalone (`task app:api`), there is no Aspire dashboard — use Application Insights or attach a local OTLP collector.

### Foundry agents not found

Run `task app:agent:init` to create the agents. Agent version must be `"1"` (not `"latest"`).
