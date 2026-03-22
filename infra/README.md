# MaroTur Infrastructure (Terraform)

GitOps: PR → terraform plan runs in CI → merge → terraform apply runs automatically.

## Providers
- Railway (NestJS API + PostgreSQL + Redis)
- Vercel (Next.js web)
- Cloudflare (DNS)

## Setup
1. Copy `terraform.tfvars.example` to `terraform.tfvars`
2. Fill in your API tokens
3. `terraform init`
4. `terraform plan`
5. `terraform apply`
