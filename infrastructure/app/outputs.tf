output "API_URL" {
  value = "https://${azurerm_container_app.api.ingress[0].fqdn}"
}

output "WEB_URL" {
  value = "https://${azurerm_container_app.web.ingress[0].fqdn}"
}

output "MANAGED_IDENTITY_CLIENT_ID" {
  value = azurerm_user_assigned_identity.app.client_id
}
