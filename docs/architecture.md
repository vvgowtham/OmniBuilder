# OmniBuilder Architecture

## System Overview

OmniBuilder is a distributed system with these core services:

- **API Server**: NestJS monolith handling all HTTP requests
- **Analysis Workers**: Parse imported projects, detect frameworks, extract components
- **Sync Workers**: Apply visual builder edits back to source code
- **AI Workers**: LLM-powered inference for editable regions, component clustering
- **Frontend**: Next.js app with visual builder, CMS, and admin panels

## Data Flow

1. User imports project (Git/URL/ZIP)
2. Import worker downloads and scans files
3. Framework detector identifies technology stack
4. Analysis pipeline extracts routes, components, layouts
5. Canonical model built from analysis results
6. Visual builder renders canonical model
7. User edits trigger builder commands
8. Commands translated to source patches via adapters
9. Sync engine applies patches in sandbox, validates, commits

## Key Design Decisions

- Sandbox-first patching (never modify source directly)
- Adapter pattern for framework abstraction
- Canonical node model decouples UI from source format
- Event-driven architecture via Redis queues
- Snapshot-based versioning for safe rollback

## Technology Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 15, TypeScript, Tailwind, Zustand, TanStack Query |
| API | NestJS, TypeScript, Prisma, BullMQ |
| Database | PostgreSQL 16, Redis 7 |
| Storage | S3-compatible (MinIO for dev) |
| AI | OpenAI GPT-4o, text-embedding-3-small |
| Infra | Docker, Kubernetes, Terraform |
| CI/CD | GitHub Actions |

## Adapter Architecture

Each framework gets its own adapter implementing:
- `detect()` - Identify if project uses this framework
- `extractRoutes()` - Find all page routes
- `extractComponents()` - Discover reusable components
- `extractLayouts()` - Find layout templates
- `identifyEditableRegions()` - Mark editable content
- `generatePatch()` - Convert builder edits to source patches
- `validateBuild()` - Verify project still builds after patch
