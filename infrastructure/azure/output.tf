output "APP_NAME" {
  value     = local.resource_name
  sensitive = false
}

output "APP_RESOURCE_GROUP" {
  value     = azurerm_resource_group.this.name
  sensitive = false
}

output "OPENAI_ENDPOINT" {
  value     = data.azurerm_cognitive_account.ai_foundry.endpoint
  sensitive = false
}

output "FOUNDRY_PROJECT_ENDPOINT" {
  value     = module.project_1.PROJECT_ENDPOINT
  sensitive = false
}

output "APPLICATION_INSIGHTS_CONNECTION_STRING" {
  value     = module.project_1.APPINSIGHTS_CONNECTION_STRING
  sensitive = true
}

output "ACR_NAME" {
  value     = azurerm_container_registry.this.name
  sensitive = false
}

output "COSMOSDB_ENDPOINT" {
  value     = module.project_1.COSMOSDB_ENDPOINT
  sensitive = false
}

output "STORAGE_BLOB_ENDPOINT" {
  value     = module.project_1.STORAGE_BLOB_ENDPOINT
  sensitive = false
}