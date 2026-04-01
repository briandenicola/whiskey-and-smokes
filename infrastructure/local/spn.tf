# ── Service Principal for local Docker production deployment ──
# Enables containerized API to authenticate to Foundry without az login

resource "azuread_application" "local_docker" {
  display_name = "${local.resource_name}-local-docker"
}

resource "azuread_service_principal" "local_docker" {
  client_id = azuread_application.local_docker.client_id
}

resource "azuread_application_password" "local_docker" {
  application_id = azuread_application.local_docker.id
  display_name   = "local-docker-deployment"
  end_date       = timeadd(timestamp(), "8760h") # 1 year
  lifecycle {
    ignore_changes = [end_date]
  }
}

# Same roles as the local user — Foundry access
resource "azurerm_role_assignment" "spn_openai_user" {
  scope                = azurerm_resource_group.this.id
  role_definition_name = "Cognitive Services OpenAI User"
  principal_id         = azuread_service_principal.local_docker.object_id
}

resource "azurerm_role_assignment" "spn_ai_developer" {
  scope                = azurerm_resource_group.this.id
  role_definition_name = "Azure AI Developer"
  principal_id         = azuread_service_principal.local_docker.object_id
}
