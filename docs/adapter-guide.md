# Framework Adapter Development Guide

## Overview

OmniBuilder uses an adapter pattern to support multiple frameworks. Each adapter implements the `BaseFrameworkAdapter` interface from `@omnibuilder/adapter-core`.

## Creating a New Adapter

1. Create a new package in `adapters/adapter-yourframework/`
2. Implement all required methods from `BaseFrameworkAdapter`
3. Register the adapter in the `AdapterRegistry`
4. Add test fixtures in `adapters/adapter-yourframework/fixtures/`

## Required Methods

### detect(manifest)
Return whether this adapter can handle the given project. Check for framework-specific files (package.json deps, config files, directory structure).

### extractRoutes(ctx)
Parse routing configuration and return all page routes with their source file mappings.

### extractComponents(ctx)
Find all reusable components with their props, slots, and types.

### extractLayouts(ctx)
Identify layout templates (headers, footers, wrappers).

### identifyEditableRegions(ctx, filePath)
Mark content that users can edit visually (text, images, links).

### generatePatch(request)
Convert a builder command into file-level patches that preserve the framework's idioms.

### validateBuild(ctx)
Run the framework's build/lint to verify patches didn't break anything.

## Testing

Every adapter needs fixture projects:
- `fixtures/simple/` - Minimal working app
- `fixtures/medium/` - Real-world complexity
- `fixtures/legacy/` - Messy older codebase

Run: `npm test -- --filter=adapter-yourframework`
