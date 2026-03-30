variable "app_name" {
  description = "Application name used in resource naming"
  type        = string
  default     = "sippuff"
}

variable "environment" {
  description = "Environment name (dev, prod)"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "southcentralus"
}

variable "subscription_id" {
  description = "Azure subscription ID"
  type        = string
}

variable "azure_ad_tenant_id" {
  description = "Azure AD tenant ID for authentication"
  type        = string
}

variable "azure_ad_api_client_id" {
  description = "Azure AD client ID for the API app registration"
  type        = string
}

variable "tags" {
  description = "Tags to apply to all resources"
  type        = map(string)
  default = {
    app        = "sippuff"
    managed_by = "terraform"
  }
}
