output "app_url" {
  description = "URL of the deployed application"
  value       = "https://${var.app_hostname}"
}

output "render_service_id" {
  description = "ID du service Render"
  value       = render_web_service.app.id
}

output "db_external_url" {
  description = "Connection string externe pour se connecter à la DB depuis ta machine"
  value       = render_postgres.db.connection_info.external_connection_string
  sensitive   = true
}

output "actual_app_url" {
  description = "URL réelle attribuée par Render (peut différer de app_hostname si Render a ajouté un suffixe)"
  value       = "https://${render_web_service.app.url}"
}
