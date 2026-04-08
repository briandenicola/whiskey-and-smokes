
module "project_1" {
  depends_on = [
    azapi_resource.ai_foundry,
  ]
  source = "./project"

  foundry_project = {
    name          = local.project_name
    location      = local.location
    resource_name = local.resource_name
    tag           = var.tags

    ai_foundry = {
      id   = azapi_resource.ai_foundry.id
      name = azapi_resource.ai_foundry.name
    }

    logs = {
      workspace_id                  = azurerm_log_analytics_workspace.this.id
      app_insight_name              = azurerm_application_insights.this.name
      app_insight_id                = azurerm_application_insights.this.id
      app_insight_connection_string = azurerm_application_insights.this.connection_string
    }

    models = [
      {
        name    = "gpt-4.1"
        version = "2025-04-14"
        format  = "OpenAI"
      },
      {
        name    = "gpt-5-mini"
        version = "2025-01-31"
        format  = "OpenAI"
      }
    ]
  }
}
