locals {
  # Derived from infrastructure naming convention
  core_rg_name     = "${var.app_name}-core_rg"
  ai_rg_name       = "${var.app_name}-ai_rg"
  acr_name         = "${replace(var.app_name, "-", "")}acr"
  cae_name         = "${var.app_name}-env"
  ai_services_name = "${var.app_name}-foundry"

  # Project name follows infrastructure convention
  project_name = "${var.app_name}-project"

  # App resource names
  apps_rg_name  = "${var.app_name}_apps_rg"
  identity_name = "${var.app_name}-app-identity"
  api_app_name  = "${var.app_name}-api"
  web_app_name  = "${var.app_name}-web"

  # Container images
  acr_login_server = "${local.acr_name}.azurecr.io"
  api_image        = "${local.acr_login_server}/whiskey-and-smokes-api:${var.commit_version}"
  web_image        = "${local.acr_login_server}/whiskey-and-smokes-web:${var.commit_version}"

  # Foundry endpoint
  foundry_project_endpoint = "https://${local.ai_services_name}.services.ai.azure.com/api/projects/${local.project_name}"
}
