resource "azurerm_virtual_network" "this" {
  name                = local.vnet_name
  address_space       = [local.vnet_cidr]
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
}

resource "azurerm_subnet" "private-endpoints" {
  name                 = "private-endpoints"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [local.pe_subnet_cidr]
}

resource "azurerm_subnet" "agents" {
  name                 = "agents"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [local.agent_subnet_cidr]
  delegation {
    name = "agent-delegation"

    service_delegation {
      name = "Microsoft.App/environments"
    }
  }
}

resource "azurerm_subnet" "nodes" {
  lifecycle {
    ignore_changes = [
      delegation
    ]
  }

  name                 = "nodes"
  resource_group_name  = azurerm_resource_group.core.name
  virtual_network_name = azurerm_virtual_network.this.name
  address_prefixes     = [local.nodes_subnet_cidir]

  delegation {
    name = "container-apps"

    service_delegation {
      name = "Microsoft.App/environments"
    }
  }

}

# resource "azapi_update_resource" "nodes_delegation" {
#   type        = "Microsoft.Network/virtualNetworks/subnets@2023-04-01"
#   resource_id = azurerm_subnet.nodes.id

#   body = {
#     properties= {
#       delegations = [{
#         name = "Microsoft.App.environment"

#         properties = {
#           serviceName = "Microsoft.App/environments"
#           actions = [
#             "Microsoft.Network/virtualNetworks/subnets/join/action"
#           ]
#         }
#       }]
#     }
#   }
# }

resource "azurerm_network_security_group" "this" {
  name                = local.nsg_name
  location            = azurerm_resource_group.core.location
  resource_group_name = azurerm_resource_group.core.name
}

resource "azurerm_subnet_network_security_group_association" "pe" {
  subnet_id                 = azurerm_subnet.private-endpoints.id
  network_security_group_id = azurerm_network_security_group.this.id
}

resource "azurerm_subnet_network_security_group_association" "agents" {
  subnet_id                 = azurerm_subnet.agents.id
  network_security_group_id = azurerm_network_security_group.this.id
}

resource "azurerm_subnet_network_security_group_association" "nodes" {
  subnet_id                 = azurerm_subnet.nodes.id
  network_security_group_id = azurerm_network_security_group.this.id
}
