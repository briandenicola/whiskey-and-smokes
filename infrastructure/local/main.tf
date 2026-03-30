locals {
  resource_name          = "${random_pet.this.id}-${random_id.this.dec}"
  openai_name            = "${local.resource_name}-openai"
}