# Azure only allows one deployment operation at a time per Cognitive Services account.
# Build an ordered map keyed by name, with each entry referencing its predecessor.
# The tags dependency forces Terraform to serialize creation in list order.

locals {
  model_list = var.foundry_project.models
  model_map = {
    for idx, m in local.model_list : m.name => merge(m, {
      index = idx
      prev  = idx > 0 ? local.model_list[idx - 1].name : null
    })
  }
}

resource "azapi_resource" "model_deployments" {
  for_each  = local.model_map
  type      = "Microsoft.CognitiveServices/accounts/deployments@2025-06-01"
  name      = each.value.name
  parent_id = var.foundry_project.ai_foundry.id

  body = {
    properties = {
      model = {
        format  = each.value.format
        name    = each.value.name
        version = each.value.version
      }
    }
    sku = {
      name     = "GlobalStandard"
      capacity = 250
    }
  }

  # Reference the previous deployment to create an implicit dependency chain
  tags = each.value.prev != null ? {
    deploy_after = azapi_resource.model_deployments[each.value.prev].id
  } : {}
}