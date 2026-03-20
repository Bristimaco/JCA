# Digital Ocean Deployment

## Automatic Deployment

This project is configured for Digital Ocean App Platform. Pushing to `main` triggers an automatic deployment.

## Setup

1. Go to [Digital Ocean App Platform](https://cloud.digitalocean.com/apps)
2. Click "Create App" → Import from GitHub → Select `Bristimaco/JCA`
3. DO will detect `.do/app.yaml` automatically
4. Set the `APP_KEY` secret (run `php artisan key:generate --show` locally)
5. Deploy

## What happens on deploy

- `main` branch push → auto-deploy to production
- Composer dependencies installed (no-dev)
- npm dependencies installed, frontend built
- Laravel caches (config, routes, views) warmed
- Database migrations run automatically

## Git Workflow

- `main` → Production (auto-deploys to Digital Ocean)
- `test` → Local testing
- `Loc-*` → Feature branches

Feature branches merge → `test` (for local testing) → `main` (for production deploy).
