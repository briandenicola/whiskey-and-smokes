resource "azapi_resource" "application_insights_connection" {
  depends_on = [
    azapi_resource.ai_foundry_project
  ]
  type                      = "Microsoft.CognitiveServices/accounts/projects/connections@2026-01-15-preview"
  name                      = "${var.foundry_project.name}-appinsight-connection"
  parent_id                 = azapi_resource.ai_foundry_project.id
  schema_validation_enabled = false

  body = {
    name = var.foundry_project.logs.app_insight_name
    properties = {
      category      = "AppInsights"
      authType      = "ApiKey"
      isSharedToAll = false 
      metadata = {
        ApiType    = "Azure"
        ResourceId = var.foundry_project.logs.app_insight_id
        location   = var.foundry_project.location
      }
      target   = var.foundry_project.logs.app_insight_id
      credentials = {
        key = var.foundry_project.logs.app_insight_connection_string
      }      
    }
  }
}