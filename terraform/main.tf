resource "render_postgres" "db" {
  name    = "homekeep-db"
  plan    = "free"
  region  = var.region
  version = "16"
}

resource "render_web_service" "app" {
  name   = "homekeep"
  plan   = "free"
  region = var.region

  runtime_source = {
    docker = {
      repo_url        = var.github_repo_url
      branch          = "main"
      dockerfile_path = "./Dockerfile"
      auto_deploy     = false
    }
  }

  env_vars = {
    "DATABASE_URL" = {
      value = render_postgres.db.connection_info.internal_connection_string
    }
    "BETTER_AUTH_SECRET" = {
      value = var.better_auth_secret
    }
    "BETTER_AUTH_URL" = {
      value = "https://${var.app_hostname}"
    }
    "PUBLIC_BETTER_AUTH_URL" = {
      value = "https://${var.app_hostname}"
    }
    "SMTP_HOST" = {
      value = var.smtp_host
    }
    "SMTP_PORT" = {
      value = var.smtp_port
    }
    "SMTP_USER" = {
      value = var.smtp_user
    }
    "SMTP_PASS" = {
      value = var.smtp_pass
    }
    "SMTP_FROM" = {
      value = var.smtp_from
    }
    "NODE_ENV" = {
      value = "production"
    }
  }

  depends_on = [render_postgres.db]
}
