locals {
  location             = var.region
  resource_name        = "${random_pet.this.id}-${random_id.this.dec}"
  ai_services_name     = "${local.resource_name}-foundry"
  vnet_name            = "${local.resource_name}-network"
  loganalytics_name    = "${local.resource_name}-logs"
  nsg_name             = "${local.resource_name}-nsg"
  app_insights_name    = "${local.resource_name}-appinsights"
  cosmosdb_name        = "${local.resource_name}-db"
  project_name         = "${local.resource_name}-project"
  aca_name             = "${local.resource_name}-env"
  
  storage_account_name = "${substr(replace(random_uuid.guid.result, "-", ""), 0, 22)}sa"
  acr_account_name     = "${replace(local.resource_name, "-", "")}acr"
  
  vnet_cidr            = "10.${random_integer.vnet_cidr.result}.0.0/16"
  pe_subnet_cidr       = cidrsubnet(local.vnet_cidr, 4, 1)
  agent_subnet_cidr    = cidrsubnet(local.vnet_cidr, 4, 2)
  compute_subnet_cidir = cidrsubnet(local.vnet_cidr, 8, 3)
  nodes_subnet_cidir   = cidrsubnet(local.vnet_cidr, 8, 4)

  workload_profile_name = "default"
  workload_profile_size = "D4"
}
