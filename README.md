# OmniBuilder — AI Universal Visual Website Builder

The world's first AI-powered universal visual website editor that transforms any existing website into an editable CMS without requiring manual coding.

## Features

- **Import Any Website**: From folders, Git, ZIP, FTP, or live URLs
- **Auto-Analysis**: Detects frameworks, components, routing, CSS, databases
- **Visual Builder**: Drag-and-drop editing with 100+ widgets
- **Source Code Sync**: Edits update original source files, not generated HTML
- **Universal CMS**: Pages, media, menus, templates, forms, SEO, analytics
- **12+ Frameworks**: React, Next.js, Vue, Angular, Laravel, Django, Spring Boot, ASP.NET, Blazor, WordPress, and more

## Supported Technologies

| Frontend | Backend | CSS | Database |
|----------|---------|-----|----------|
| React | Node.js/Express | Tailwind | PostgreSQL |
| Next.js | Laravel/PHP | Bootstrap | MySQL |
| Vue.js | Django/Python | SCSS/SASS | MongoDB |
| Angular | Spring Boot/Java | CSS Modules | SQLite |
| Svelte | ASP.NET Core/C# | Styled Components | Redis |
| Nuxt.js | Ruby on Rails | Material UI | |
| Blazor | Go/Gin | Chakra UI | |

## Quick Start

```bash
# 1. Clone
git clone https://github.com/vvgowtham/OmniBuilder.git
cd OmniBuilder

# 2. Install dependencies
npm install

# 3. Start infrastructure
docker-compose up -d

# 4. Setup database
cp .env.example .env
cd apps/api && npx prisma migrate dev && cd ../..

# 5. Seed data
cd apps/api && npx prisma db seed && cd ../..

# 6. Start development
npm run dev
```

## Architecture

```
+---------------------------------------------------------+
|                    Frontend (Next.js)                     |
|  Login | Dashboard | Visual Builder | CMS | Import       |
+---------------------------------------------------------+
|                    API Gateway (NestJS)                   |
|  Auth | Projects | Builder | Pages | Media | Sync | AI   |
+----------+----------+----------+------------------------+
| Analysis |   Sync   |    AI    |    Deployment          |
|  Worker  |  Worker  |  Worker  |     Worker             |
+----------+----------+----------+------------------------+
|  PostgreSQL  |  Redis  |  S3 Storage  |  Docker Runner  |
+---------------------------------------------------------+
```

## Project Structure

```
omnibuilder/
├── apps/
│   ├── web/                 # Next.js frontend
│   ├── api/                 # NestJS backend API
│   ├── worker-analysis/     # Code analysis worker
│   ├── worker-sync/         # Source code sync worker
│   └── worker-ai/           # AI inference worker
├── packages/
│   ├── adapter-core/        # Adapter interfaces & types
│   ├── types/               # Shared TypeScript types
│   └── config/              # Shared configs
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
│   ├── docker/
│   ├── helm/
│   └── terraform/
└── docs/
```

## Login Credentials (Development)

- **Email**: admin@omnibuilder.com
- **Password**: admin123

## License

Proprietary. All rights reserved.
