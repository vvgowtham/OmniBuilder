# OmniBuilder API Reference

Base URL: `http://localhost:4000/api/v1`

## Authentication

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /auth/register | Register new account |
| POST | /auth/login | Login (returns JWT) |
| GET | /auth/me | Current user profile |
| POST | /auth/refresh | Refresh token |
| POST | /auth/logout | Invalidate session |

## Projects

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects | List all projects |
| POST | /projects | Create project |
| GET | /projects/:id | Get project details |
| PATCH | /projects/:id | Update project |
| DELETE | /projects/:id | Delete project |

## Imports

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /projects/:id/imports | Start import (url/git/zip/ftp/folder) |
| GET | /projects/:id/imports/:importId | Get import status |
| GET | /projects/:id/imports | List all imports |

## Analysis

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /projects/:id/analyze | Run full analysis |
| GET | /projects/:id/analysis | Get analysis results |
| GET | /projects/:id/analysis/routes | Get detected routes |
| GET | /projects/:id/analysis/components | Get detected components |

## Visual Builder

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/builder/pages/:pageId | Get page node tree |
| POST | /projects/:id/builder/nodes | Add node |
| PATCH | /projects/:id/builder/nodes/:nodeId | Update node props/styles |
| DELETE | /projects/:id/builder/nodes/:nodeId | Delete node |
| PATCH | /projects/:id/builder/nodes/:nodeId/move | Move node |

## Pages

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/pages | List pages |
| POST | /projects/:id/pages | Create page |
| PATCH | /projects/:id/pages/:pageId | Update page |
| DELETE | /projects/:id/pages/:pageId | Delete page |
| POST | /projects/:id/pages/:pageId/publish | Publish page |

## Media

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/media | List media assets |
| POST | /projects/:id/media | Upload file (multipart) |
| PATCH | /projects/:id/media/:assetId | Update metadata |
| DELETE | /projects/:id/media/:assetId | Delete asset |

## Sync & Versioning

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /projects/:id/changesets | List change sets |
| POST | /projects/:id/changesets/:id/rollback | Rollback changes |

## Deployments

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /projects/:id/deployments | Deploy project |
| GET | /projects/:id/deployments | List deployments |
| POST | /projects/:id/deployments/:id/rollback | Rollback deployment |
