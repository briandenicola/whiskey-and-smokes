# Azure only allows one deployment operation at a time per Cognitive Services account.
# Terraform treats all count/for_each instances as a single node in the dependency graph,
# so any self-reference creates a cycle. We split into two resources with depends_on.

locals {
  model_list = var.foundry_project.models
}

resource "azapi_resource" "model_deployment_first" {
  type      = "Microsoft.CognitiveServices/accounts/deployments@2025-06-01"
  name      = local.model_list[0].name
  parent_id = var.foundry_project.ai_foundry.id

  body = {
    properties = {
      model = {
        format  = local.model_list[0].format
        name    = local.model_list[0].name
        version = local.model_list[0].version
      }
    }
    sku = {
      name     = "GlobalStandard"
      capacity = 250
    }
  }
}

resource "azapi_resource" "model_deployment_rest" {
  count     = length(local.model_list) - 1
  type      = "Microsoft.CognitiveServices/accounts/deployments@2025-06-01"
  name      = local.model_list[count.index + 1].name
  parent_id = var.foundry_project.ai_foundry.id

  body = {
    properties = {
      model = {
        format  = local.model_list[count.index + 1].format
        name    = local.model_list[count.index + 1].name
        version = local.model_list[count.index + 1].version
      }
    }
    sku = {
      name     = "GlobalStandard"
      capacity = 250
    }
  }

  depends_on = [azapi_resource.model_deployment_first]
}