# Copilot Coding Agent Instructions — JCA

## Project Overview

JCA is a full-stack web application using **Laravel 13** (PHP 8.5) as the backend API/routing layer and **React 19** as the frontend via **Inertia.js v2**. The database is **PostgreSQL 17**. Styling uses **Tailwind CSS v4**. The app is hosted on **Digital Ocean App Platform** and auto-deploys from the `main` branch.

## Tech Stack & Versions

| Layer     | Technology                  | Version |
|-----------|-----------------------------|---------|
| Runtime   | PHP                         | 8.5     |
| Framework | Laravel                     | 13.x    |
| Frontend  | React (via Inertia.js)      | 19.x    |
| Inertia   | @inertiajs/react            | 2.x     |
| Database  | PostgreSQL                  | 17      |
| Build     | Vite                        | 8.x     |
| CSS       | Tailwind CSS (@tailwindcss/vite) | 4.x |
| Linter    | Laravel Pint (Laravel preset) | 1.x   |
| Tests     | PHPUnit                     | 12.x   |

## Build, Test & Lint Commands

Always run these commands from the project root. Always run `composer install` and `npm ci` before building if `vendor/` or `node_modules/` are missing.

### Install dependencies (required before anything else)
```bash
composer install
npm ci
```

### Build frontend (production)
```bash
npm run build
```
This runs `vite build` and outputs to `public/build/`. Takes ~2 seconds.

### Run tests
```bash
php artisan test
```
Or equivalently: `composer test` (which clears config cache first, then runs tests). Tests use an **in-memory SQLite database** (configured in `phpunit.xml`), so PostgreSQL does not need to be running for tests to pass.

### Lint / code style (PHP)
```bash
vendor/bin/pint --test     # Check for violations (dry-run)
vendor/bin/pint            # Auto-fix violations
```
Pint uses the **Laravel preset** (no custom `pint.json`). Key rules:
- Use `use` imports at the top of the file, never inline FQCN like `\App\Http\...::class`.
- String concatenation without spaces: `__DIR__.'/../routes'` (not `__DIR__ . '/../routes'`).
- Always run `vendor/bin/pint` after editing PHP files to auto-fix style before committing.

### Run database migrations
```bash
php artisan migrate
```

### Full validation sequence (run this before committing)
```bash
npm run build && php artisan test && vendor/bin/pint --test
```

### Start local dev servers
```bash
composer dev
```
This starts Laravel server, queue worker, log viewer (Pail), and Vite dev server concurrently.

Alternatively, run them separately:
```bash
php artisan serve         # Laravel on http://127.0.0.1:8000
npm run dev               # Vite HMR dev server
```

## Project Layout

```
├── .do/                          # Digital Ocean deployment config
│   └── app.yaml                  # App Platform spec (auto-deploy from main)
├── app/
│   ├── Http/
│   │   ├── Controllers/          # Laravel controllers
│   │   └── Middleware/
│   │       └── HandleInertiaRequests.php  # Inertia middleware (shares props)
│   ├── Models/                   # Eloquent models (User.php)
│   └── Providers/                # Service providers (AppServiceProvider.php)
├── bootstrap/
│   └── app.php                   # App bootstrap (routing, middleware registration)
├── config/                       # Laravel config files (database.php, app.php, etc.)
├── database/
│   ├── factories/                # Model factories for testing
│   ├── migrations/               # Database migrations (PostgreSQL)
│   └── seeders/                  # Database seeders
├── public/                       # Web root (index.php entry point)
├── resources/
│   ├── css/app.css               # Tailwind CSS entry (uses @import 'tailwindcss')
│   ├── js/
│   │   ├── app.jsx               # React/Inertia entry point (auto-resolves Pages)
│   │   ├── bootstrap.js          # Axios setup
│   │   └── Pages/                # React page components (*.jsx)
│   │       └── Home.jsx          # Example page
│   └── views/
│       └── app.blade.php         # Root Blade template for Inertia
├── routes/
│   └── web.php                   # Web routes (use Inertia::render for pages)
├── tests/
│   ├── Feature/                  # Feature/integration tests
│   ├── Unit/                     # Unit tests
│   └── TestCase.php              # Base test class
├── composer.json                 # PHP dependencies + scripts (setup, dev, test)
├── package.json                  # Node dependencies + scripts (build, dev)
├── phpunit.xml                   # Test config (SQLite in-memory for tests)
├── vite.config.js                # Vite config (Laravel plugin + React + Tailwind)
└── .env.example                  # Environment template (PostgreSQL)
```

## Architecture: How Inertia.js Works

Routes in `routes/web.php` return `Inertia::render('PageName')` instead of Blade views. This renders a React component from `resources/js/Pages/PageName.jsx`. The page resolution is handled in `resources/js/app.jsx` using `import.meta.glob('./Pages/**/*.jsx')`.

**To add a new page:**
1. Create `resources/js/Pages/MyPage.jsx` (React component with default export).
2. Add a route in `routes/web.php`: `Route::get('/mypage', fn() => Inertia::render('MyPage'));`
3. For nested pages use dot notation in folder structure: `Pages/Admin/Dashboard.jsx` → `Inertia::render('Admin/Dashboard')`.

**To pass data from backend to frontend:**
```php
return Inertia::render('MyPage', ['users' => User::all()]);
```
Props are available as component props in React.

## Git Branch Strategy

- **`main`** — Production. Pushes auto-deploy to Digital Ocean. **Never push directly; the user merges to main manually.**
- **`test`** — Local testing branch. Feature branches merge here first.
- **`Loc-*`** — Feature branches (prefix: `Loc-`). Merge into `test` when complete.

## Key Configuration Details

- **Database:** PostgreSQL in production and local dev. Tests use SQLite in-memory (see `phpunit.xml`).
- **No custom Pint config:** Uses default Laravel preset.
- **No GitHub Actions/CI workflows** configured yet.
- **Inertia middleware** is registered in `bootstrap/app.php` (not `Kernel.php` — Laravel 13 uses the new bootstrap approach).
- **Vite entry points:** `resources/css/app.css` and `resources/js/app.jsx` (JSX, not JS).
- **Blade root template:** `resources/views/app.blade.php` — contains `@viteReactRefresh`, `@vite()`, `@inertiaHead`, and `@inertia`.

## Common Artisan Commands

```bash
php artisan make:model ModelName -m        # Create model + migration
php artisan make:controller ControllerName # Create controller
php artisan make:migration create_x_table  # Create migration
php artisan migrate                        # Run pending migrations
php artisan migrate:rollback               # Rollback last migration batch
php artisan route:list                     # List all registered routes
php artisan tinker                         # Interactive REPL
```

## Important Notes

- Trust these instructions. Only search the codebase if the information here is incomplete or found to be in error.
- Always run `vendor/bin/pint` after editing PHP files — the Laravel preset enforces strict style rules.
- Always run `npm run build` after editing JSX/CSS files to verify the frontend compiles.
- React page files must use `.jsx` extension (not `.js` or `.tsx`).
- The `public/build/` directory is gitignored — it is generated by `npm run build`.
- The `.env` file is gitignored. Use `.env.example` as the template. The app key is in `.env` (never commit it).
