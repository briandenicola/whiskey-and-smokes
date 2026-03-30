# SipPuff 🥃💨

Track your whiskey, wine, cocktails & cigars. Snap a photo at the bar, let AI do the rest, refine later.

## Architecture

- **Frontend**: Vue 3 + TypeScript + TailwindCSS (mobile-first PWA)
- **Backend**: .NET 10 Web API
- **Database**: Azure CosmosDB (NoSQL)
- **Storage**: Azure Blob Storage (photos)
- **AI**: Azure AI Foundry Agent Service
- **Auth**: Azure Entra ID
- **Infra**: Terraform → Azure Container Apps
- **CI/CD**: GitHub Actions

## Quick Start

### Prerequisites
- .NET 10 SDK
- Node.js 22+
- Docker & Docker Compose
- Azure CLI (for deployment)

### Local Development

1. Start infrastructure emulators:
   ```bash
   docker compose up cosmosdb azurite -d
   ```

2. Run the API:
   ```bash
   cd src/api/SipPuff.Api
   dotnet run
   ```

3. Run the frontend:
   ```bash
   cd src/web
   npm install
   npm run dev
   ```

4. Open http://localhost:5173

### Deploy to Azure

1. Configure Terraform variables in `infra/environments/dev.tfvars`

2. Deploy infrastructure:
   ```bash
   cd infra
   terraform init
   terraform plan -var-file=environments/dev.tfvars
   terraform apply -var-file=environments/dev.tfvars
   ```

3. Push to `main` branch to trigger GitHub Actions deployment.

## Project Structure

```
├── src/
│   ├── api/                    # .NET 10 Web API
│   │   └── SipPuff.Api/
│   └── web/                    # Vue 3 Frontend
├── infra/                      # Terraform
├── .github/workflows/          # CI/CD
├── docker-compose.yml          # Local dev
└── README.md
```
