output "API_URL" {
  value = "https://${azurerm_container_app.api.ingress[0].fqdn}"
}

output "WEB_URL" {
  value = "https://${azurerm_static_web_app.web.default_host_name}"
}

output "SWA_DEPLOYMENT_TOKEN" {
  value     = azurerm_static_web_app.web.api_key
  sensitive = true
}

output "MANAGED_IDENTITY_CLIENT_ID" {
  value = azurerm_user_assigned_identity.app.client_id
}
