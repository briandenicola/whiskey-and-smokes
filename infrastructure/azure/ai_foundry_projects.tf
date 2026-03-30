
module "project_classic" {
  depends_on = [
    azapi_resource.ai_foundry,
  ]
  source   = "./project"

  foundry_project = {
    name          = "${local.project_name}-classic"
    location      = local.location
    resource_name = local.resource_name
    tag           = var.tags

    ai_foundry    = {
      id = azapi_resource.ai_foundry.id
      name = azapi_resource.ai_foundry.name
    }

    logs          = {
      workspace_id = azurerm_log_analytics_workspace.this.id
    }

    models        = [{
      name     = "gpt-4.1"
      version  = "2025-04-14"
      format   = "OpenAI"
    }]
  }
}


module "project_workflow" {
  depends_on = [
    azapi_resource.ai_foundry,
    module.project_classic
  ]
  source   = "./project"

  foundry_project = {
    name          = "${local.project_name}-workflow"
    location      = local.location
    resource_name = local.resource_name
    tag           = var.tags

    ai_foundry    = {
      id = azapi_resource.ai_foundry.id
      name = azapi_resource.ai_foundry.name
    }

    logs          = {
      workspace_id = azurerm_log_analytics_workspace.this.id
    }

    models        = [{
      name     = "gpt-5.2"
      version  = "2025-12-11"
      format   = "OpenAI"
    }]
  }
}
