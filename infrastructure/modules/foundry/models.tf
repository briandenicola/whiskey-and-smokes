resource "azurerm_cognitive_deployment" "gpt" {
  name                 = "gpt-5.4-mini"
  cognitive_account_id = azurerm_cognitive_account.this.id
  model {
    format  = "OpenAI"
    name    = "gpt-5.4-mini"
    version = "2026-03-17"
  }

  sku {
    name = "GlobalStandard"
    capacity = 10
  }
}