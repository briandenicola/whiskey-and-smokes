output "APP_NAME" {
  value     = local.resource_name
  sensitive = false
}

output "APP_RESOURCE_GROUP" {
  value     = azurerm_resource_group.this.name
  sensitive = false
}

output "OPENAI_ENDPOINT" {
  value     = azapi_resource.ai_foundry.output.properties.endpoint
  sensitive = false
}

output "FOUNDRY_PROJECT_ENDPOINT" {
  value     = module.project_1.PROJECT_ENDPOINT
  sensitive = false
}

output "APPLICATION_INSIGHTS_CONNECTION_STRING" {
  value     = azurerm_application_insights.this.connection_string
  sensitive = true
}

output "SPN_CLIENT_ID" {
  value     = azuread_application.this.client_id
  sensitive = false
}

output "SPN_CLIENT_SECRET" {
  value     = azuread_application_password.this.value
  sensitive = true
}

output "SPN_TENANT_ID" {
  value     = data.azurerm_client_config.current.tenant_id
  sensitive = false
}
