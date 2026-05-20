output "app_url" {
  description = "URL of the deployed application"
  value       = "https://${var.app_hostname}"
}

output "render_service_id" {
  description = "ID du service Render"
  value       = render_web_service.app.id
}
