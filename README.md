# OmniBuilder - AI Universal Visual Website Builder

The world's first AI-powered universal visual website editor that transforms any existing website into an editable CMS without requiring manual coding.

## Prerequisites

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 22+ | Runtime |
| PNPM | 11+ | Package manager |
| Docker Desktop | Latest | PostgreSQL + Redis |
| Git | Latest | Version control |

### Windows Setup

1. Install [Node.js 22+](https://nodejs.org/) (includes npm)
2. Install PNPM: `npm install -g pnpm@latest`
3. Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) (enable WSL2 backend)
4. Install [Git](https://git-scm.com/download/win)

### macOS / Linux Setup

1. Install Node.js 22+ via [nvm](https://github.com/nvm-sh/nvm) or [fnm](https://github.com/Schniz/fnm)
2. Install PNPM: `npm install -g pnpm@latest`
3. Install Docker: `brew install --cask docker` (macOS) or `apt install docker.io` (Linux)

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/vvgowtham/OmniBuilder.git
cd OmniBuilder

# 2. Install all dependencies
pnpm install

# 3. Start infrastructure (PostgreSQL + Redis + MinIO)
docker compose up -d

# 4. Setup database
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev
pnpm prisma db seed
cd ../..

# 5. Start all services
pnpm turbo run dev
```

## Services

| Service | URL | Description |
|---------|-----|-------------|
| Frontend | http://localhost:3000 | Next.js app |
| API | http://localhost:4000 | NestJS backend |
| API Docs | http://localhost:4000/api/v1 | Swagger |
| MinIO Console | http://localhost:9001 | Object storage UI |

## Login Credentials

| Email | Password | Role |
|-------|----------|------|
| admin@omnibuilder.com | admin123 | Administrator |

> The login page includes a **demo mode** fallback. If the API is not running, use the above credentials and it will log you into the dashboard with a demo token.

## Project Structure

```
omnibuilder/
├── apps/
│   ├── api/                 # NestJS backend (port 4000)
│   ├── web/                 # Next.js frontend (port 3000)
│   ├── worker-analysis/     # Code analysis worker
│   ├── worker-sync/         # Source code sync worker
│   └── worker-ai/           # AI inference worker
├── packages/
│   ├── adapter-core/        # Adapter interfaces & base class
│   └── types/               # Shared TypeScript types
├── adapters/
│   ├── adapter-react/
│   ├── adapter-nextjs/
│   ├── adapter-vue/
│   ├── adapter-angular/
│   ├── adapter-laravel/
│   ├── adapter-django/
│   ├── adapter-wordpress/
│   ├── adapter-aspnet/
│   ├── adapter-blazor/
│   ├── adapter-springboot/
│   └── adapter-html/
├── infrastructure/
│   └── docker/
├── docs/
├── docker-compose.yml
├── turbo.json
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

## PNPM Build Approvals

On first `pnpm install`, PNPM v11 may ask to approve build scripts. Run:

```bash
pnpm approve-builds
```

Approve all listed packages (prisma, sharp, esbuild, etc). This is configured in `package.json` under `pnpm.onlyBuiltDependencies`.

## Environment Variables

The API reads from `apps/api/.env` (included in repo for development):

| Variable | Default | Description |
|----------|---------|-------------|
| DATABASE_URL | postgresql://postgres:postgres@localhost:5432/omnibuilder | PostgreSQL connection |
| REDIS_HOST | localhost | Redis host |
| JWT_SECRET | omnibuilder-dev-secret | JWT signing key |
| PORT | 4000 | API port |
| FRONTEND_URL | http://localhost:3000 | CORS origin |

## Architecture

- **Frontend**: Next.js 15 with App Router, Tailwind CSS
- **Backend**: NestJS with Prisma ORM, JWT auth, BullMQ queues
- **Database**: PostgreSQL 16 with 30+ models
- **Cache/Queue**: Redis 7
- **Storage**: S3-compatible (MinIO for local)
- **Workers**: Standalone Node processes for async tasks
- **Adapters**: Plugin system for framework-specific code analysis

## Available Pages

- `/login` - Authentication
- `/register` - Create account
- `/dashboard` - Overview with stats and activity
- `/import` - Import website wizard
- `/visual-builder` - Drag-and-drop page editor
- `/pages` - Page management
- `/posts` - Blog posts
- `/media` - Media library
- `/menus` - Navigation menus
- `/theme-builder` - Theme templates
- `/templates` - Page templates
- `/components` - Reusable components
- `/users` - User management
- `/roles` - Roles & permissions
- `/forms` - Form builder
- `/plugins` - Plugin management
- `/integrations` - Third-party integrations
- `/popup-builder` - Popup builder
- `/sliders` - Slider management
- `/seo` - SEO tools
- `/analytics` - Traffic analytics
- `/backup` - Backup & restore
- `/settings` - General settings
- `/system-status` - Server health

## Troubleshooting

### "Cannot connect to API server"
The API needs PostgreSQL running. Start Docker first:
```bash
docker compose up -d
```
Then start the API separately or use `pnpm turbo run dev`.

Alternatively, the login page has demo mode: just click Login with the default credentials.

### Prisma seed fails
Make sure you have `tsx` installed (it's in devDependencies). The seed uses `tsx` instead of `ts-node`.

### TypeScript errors in adapters
Run `pnpm turbo run build` from root to build all packages in dependency order.

### Windows path issues
All paths use forward slashes internally. Docker volumes may need WSL2 backend enabled.

## License

Proprietary. All rights reserved.
