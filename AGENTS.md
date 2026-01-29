# AGENTS.md — toko-kita

This file gives coding agents consistent rules for working in this repo.

## Project
- Name: toko-kita (admin/inventory/order management)
- Stack: React + TypeScript (Vite), Tailwind CSS, Node/Express, PostgreSQL, Drizzle ORM

## Goals
- Prefer small, safe changes.
- Keep UI consistent with existing components in `client/src/components/ui`.
- Avoid changing business logic unless explicitly requested.

## Repo layout (common paths)
- Client: `client/src`
- Server: `server`
- Shared types/schemas: `shared`
- Scripts: `script`

## UI conventions
- Use existing UI components (Button, Input, Dialog, etc.).
- Prefer Tailwind utility classes that match existing patterns (`premium-card`, `page-title`, etc.).
- Keep layouts simple and admin-standard.
- Use Lucide icons if adding icons.

## Data rules
- Variant pricing uses `priceCents` and `currency` (IDR).
- Variant selections must map attribute -> option.
- Respect soft deletes with `isActive`.

## Testing
- Only run tests/build when requested.
- If you run anything, report results succinctly.

## Commits
- Provide short, imperative commit messages when asked.

## Ask when unsure
- If a change might affect data integrity, ask before proceeding.
