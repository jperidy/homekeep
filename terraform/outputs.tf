output "app_url" {
  description = "URL of the deployed application"
  value       = "https://${var.app_hostname}"
}

output "deploy_hook_instructions" {
  description = "Where to find the deploy hook URL"
  value       = "Dashboard Render > homekeep > Settings > Deploy Hook > copier l'URL > GitHub secret RENDER_DEPLOY_HOOK"
}
