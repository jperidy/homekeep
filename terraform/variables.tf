variable "render_api_key" {
  description = "Render API key (Settings > API Keys)"
  type        = string
  sensitive   = true
}


variable "render_owner_id" {
  description = "Render owner ID (visible in account URL: dashboard.render.com/u/<owner_id>)"
  type        = string
}

variable "github_repo_url" {
  description = "GitHub repository URL (ex: https://github.com/jbperidy/homekeep)"
  type        = string
}

variable "better_auth_secret" {
  description = "Secret for better-auth (min 32 chars, ex: openssl rand -base64 32)"
  type        = string
  sensitive   = true
}

variable "smtp_host" {
  description = "SMTP host (ex: smtp.brevo.com)"
  type        = string
  default     = ""
}

variable "smtp_port" {
  description = "SMTP port"
  type        = string
  default     = "587"
}

variable "smtp_user" {
  description = "SMTP username"
  type        = string
  default     = ""
  sensitive   = true
}

variable "smtp_pass" {
  description = "SMTP password"
  type        = string
  default     = ""
  sensitive   = true
}

variable "smtp_from" {
  description = "SMTP from address"
  type        = string
  default     = "HomeKeep <noreply@homekeep.app>"
}

variable "app_hostname" {
  description = "Hostname de l'app sur Render (ex: homekeep.onrender.com). Render attribue ce nom automatiquement basé sur le nom du service."
  type        = string
  default     = "homekeep.onrender.com"
}

variable "region" {
  description = "Render region"
  type        = string
  default     = "frankfurt"
}
