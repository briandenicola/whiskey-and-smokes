resource "azurerm_resource_group" "this" {
  name     = "${local.resource_name}-app_rg"
  location = local.location
  tags = {
    Application = var.tags
    DeployedOn  = timestamp()
    AppName     = local.resource_name
    Tier        = "AI Foundry; Cosmos DB; Azure Storage; Container Apps, Managed Identity"
  }
}

resource "azurerm_resource_group" "core" {
  name     = "${local.resource_name}-core_rg"
  location = local.location
  tags = {
    Application = var.tags
    DeployedOn  = timestamp()
    AppName     = local.resource_name
    Tier        = "Azure Virtual Network; Azure Log Analytics; Azure Network Security Group; Container Apps Environment; Azure Container Registry"
  }
}