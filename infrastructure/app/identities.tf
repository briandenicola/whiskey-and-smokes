resource "azurerm_user_assigned_identity" "app" {
  name                = local.identity_name
  resource_group_name = local.apps_rg_name
  location            = var.region
}
