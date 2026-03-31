output "PROJECT_NAME" {
  value     = var.foundry_project.name
  sensitive = false
}

output "PROJECT_RESOURCE_GROUP" {
  value     = azurerm_resource_group.this.name
  sensitive = false
}

output "PROJECT_RESOURCE_GROUP_ID" {
  value     = azurerm_resource_group.this.id
  sensitive = false
}

output "PROJECT_ENDPOINT" {
  value     = "https://${var.foundry_project.ai_foundry.name}.services.ai.azure.com/api/projects/${var.foundry_project.name}"
  sensitive = false
}

output "APPINSIGHTS_CONNECTION_STRING" {
  value     = azurerm_application_insights.this.connection_string
  sensitive = true
}

output "COSMOSDB_ENDPOINT" {
  value     = azurerm_cosmosdb_account.this.endpoint
  sensitive = false
}

output "COSMOSDB_ACCOUNT_NAME" {
  value     = azurerm_cosmosdb_account.this.name
  sensitive = false
}

output "STORAGE_ACCOUNT_NAME" {
  value     = azurerm_storage_account.this.name
  sensitive = false
}

output "STORAGE_BLOB_ENDPOINT" {
  value     = azurerm_storage_account.this.primary_blob_endpoint
  sensitive = false
}