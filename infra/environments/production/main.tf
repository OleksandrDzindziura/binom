terraform {
  required_providers {
    railway = {
      source  = "terraform-community-modules/railway"
      version = "~> 0.3"
    }
    vercel = {
      source  = "vercel/vercel"
      version = "~> 1.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 4.0"
    }
  }
}

# TODO: Configure provider credentials via environment variables:
# RAILWAY_TOKEN, VERCEL_API_TOKEN, CLOUDFLARE_API_TOKEN

# Railway project for NestJS API + PostgreSQL + Redis
# resource "railway_project" "MaroTur" { ... }

# Vercel project for Next.js
# resource "vercel_project" "web" { ... }
