# Azure only allows one deployment operation at a time per Cognitive Services account.
# Use count with index-based dependency to serialize deployments without cycles.
# (for_each self-references always create cycles in Terraform's graph.)

locals {
  model_list = var.foundry_project.models
}

resource "azapi_resource" "model_deployments" {
  count     = length(local.model_list)
  type      = "Microsoft.CognitiveServices/accounts/deployments@2025-06-01"
  name      = local.model_list[count.index].name
  parent_id = var.foundry_project.ai_foundry.id

  body = {
    properties = {
      model = {
        format  = local.model_list[count.index].format
        name    = local.model_list[count.index].name
        version = local.model_list[count.index].version
      }
    }
    sku = {
      name     = "GlobalStandard"
      capacity = 100
    }
  }

  # Serialize: each deployment waits for the previous one to complete
  tags = count.index > 0 ? {
    deploy_after = azapi_resource.model_deployments[count.index - 1].id
  } : {}
}
