# Local Docker Deployment

Run Whiskey & Smokes locally with Docker Compose. Data is stored in LiteDB (files) with a Docker volume for persistence. The only external dependency is Azure AI Foundry for the AI pipeline.

## Prerequisites

- Docker and Docker Compose
- Azure AI Foundry project (provisioned via `task local:up`)
- [Task](https://taskfile.dev) (task runner)
- [Terraform](https://developer.hashicorp.com/terraform/install) (provisions Foundry + service principal)

## Quick Start

```bash
# 1. Provision Azure AI Foundry + service principal
task local:up

# 2. Copy env template and populate from Terraform outputs
cp tasks/.env.example tasks/.env
# Then fill in values from: task local:output
# For the secret: terraform -chdir=infrastructure/local output -raw SPN_CLIENT_SECRET

# 3. Build and start
docker compose --file tasks/docker-compose.local.prod.yml up --build -d

# 4. Open the app
open http://localhost:8080
```

The first user to register becomes the admin.

## Configuration

All configuration is in `tasks/.env`:

| Variable | Required | Description |
|----------|----------|-------------|
| `JWT_SECRET` | Yes | JWT signing key (min 32 characters) |
| `AI_FOUNDRY_PROJECT_ENDPOINT` | Yes | Azure AI Foundry project endpoint URL |
| `AZURE_CLIENT_ID` | Yes | Service principal client ID (from `task local:output`) |
| `AZURE_TENANT_ID` | Yes | Azure AD tenant ID (from `task local:output`) |
| `AZURE_CLIENT_SECRET` | Yes | Service principal secret (from TF output) |
| `WEB_PORT` | No | Web UI port (default: 8080) |
| `ENTRA_TENANT_ID` | No | Entra ID tenant for Microsoft sign-in |
| `ENTRA_CLIENT_ID` | No | Entra ID app registration client ID |

## Data Persistence

Data is stored in a Docker volume (`app-data`):

- **Database**: LiteDB at `/data/whiskey-and-smokes.db`
- **Uploads**: Photo files at `/data/uploads/`

To back up your data:
```bash
docker compose --file tasks/docker-compose.local.prod.yml cp api:/data ./backup
```

To restore:
```bash
docker compose --file tasks/docker-compose.local.prod.yml cp ./backup/. api:/data
```

## Azure AI Foundry Authentication

The API container uses a `ChainedTokenCredential` to authenticate with Foundry. The credential chain tries these sources in order:

1. **Azure CLI** — `AzureCliCredential` (for local dev without Docker)
2. **Environment variables** — `EnvironmentCredential` reads `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_CLIENT_SECRET` (for Docker deployments)
3. **Managed Identity** — `ManagedIdentityCredential` (for Azure Container Apps)

The `task local:up` command creates a service principal with the required Foundry roles and outputs the credentials for the `.env` file.

## Stopping and Cleanup

```bash
# Stop (preserves data)
docker compose --file tasks/docker-compose.local.prod.yml down

# Stop and remove data
docker compose --file tasks/docker-compose.local.prod.yml down -v
```

## Without AI Foundry

If `AI_FOUNDRY_PROJECT_ENDPOINT` is empty, the app falls back to keyword-based local extraction. Photos won't be analyzed by AI, but manual entry still works.
