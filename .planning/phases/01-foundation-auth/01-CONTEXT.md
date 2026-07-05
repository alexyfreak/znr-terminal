# Phase 1: Project Foundation & Auth — Context

## Domain
Working CLI scaffold with Supabase authentication (teacher/director login via Login ID + PIN) and role detection.

## Canonical Refs
- `.planning/PROJECT.md` — project vision, requirements, constraints
- `.planning/REQUIREMENTS.md` — REQ-AUTH-01 through REQ-AUTH-03, REQ-CLI-01 through REQ-CLI-03
- `.planning/ROADMAP.md` — Phase 1 definition and success criteria
- `D:\ZUNOORAA\shablon-filler\src\auth.js` — existing auth implementation (base)
- `D:\ZUNOORAA\shablon-filler\src\db.js` — existing Supabase client setup (base)
- `D:\ZUNOORAA\shablon-filler\index.js` — existing entry point (base)
- `D:\ZUNOORAA\shablon-filler\package.json` — existing dependencies
- `D:\ZUNOORAA\shablon-filler\.env` — existing Supabase credentials (to copy)

## Codebase Context
Existing project at `D:\ZUNOORAA\shablon-filler` has:
- **Stack**: Node.js ESM, `inquirer` v10, `@supabase/supabase-js` v2, `docx` v8, `dotenv`
- **Structure**: `index.js` → `src/auth.js`, `db.js`, `menu.js`, `collector.js`, `renderer.js`, `generator.js`
- **Auth pattern**: Login ID → query `teachers` table (`.maybeSingle()`), fallback to `directors` table — 3 infra retries then exit
- **Security**: Blocks `SUPABASE_SERVICE_KEY` — refuses to run (service key bypasses RLS)
- **CLI**: Box-drawing welcome header, `inquirer` for all prompts, Uzbek labels
- **Dependencies to keep**: `inquirer`, `@supabase/supabase-js`, `docx`, `dotenv`
- **New deps needed**: TypeScript toolchain (`typescript`, `tsx` for dev)

## Decisions

### Project Identity
- **Name**: `zunoora-cli` (npm package name, CLI command)
- **Display name**: "Zunoora" in the welcome banner
- **Base**: Use `D:\ZUNOORAA\shablon-filler` as starting point — copy structure, enhance

### Auth Design
- **Method**: Login ID (8 symbols) + simple PIN (4-6 digits)
- **Flow**: Prompt login_id → prompt pin → query `teachers` with both fields → fallback to `directors`
- **PIN storage**: Custom `pin_hash` column in `teachers` and `directors` tables (simple hashing for MVP)
- **No session persistence** for v1 — login every session
- **Infra error handling**: Keep 3-retry pattern from existing code
- **Security boundary**: Keep existing SERVICE_KEY guard — anon key only

### Structure & Cleanup
- **Convert to TypeScript**: `.ts` files, types for User, Shablon, Context objects
- **Keep architecture**: Same module separation (auth, db, menu, collector, renderer, generator)
- **Entry point**: `src/index.ts` (compiled/run via `tsx`)
- **Root**: `index.js` optional for `npm start` compat, or use `tsx src/index.ts`

### Supabase
- **Connection**: Copy existing `.env` from `D:\ZUNOORAA\shablon-filler\.env`
- **Client**: Keep `@supabase/supabase-js` v2 with same init pattern
- **Tables assumed**: `teachers`, `directors`, `schools`, `classes`, `shablons`

### CLI Styling
- **Framework**: Keep `inquirer` v10
- **Welcome**: Box-drawing header "Zunoora" (keep existing style, rename from "Shablon To'ldiruvchi")
- **Language**: Uzbek throughout (all prompts, labels, error messages)
- **Colors**: Use `inquirer` defaults for now (no extra color lib in v1)

### Template Types (for Phase 2 context)
- All 8 types: Ariza, Ish Tabeli, KTP, O'UM, BSB/CHB, Sillabus, Hisobot, Tushuntirish Xati

## Deferred Ideas
- **Session persistence** — save auth token to file, auto-login on next launch (future phase)
- **Password upgrade** — migrate from PIN to proper Supabase Auth password flow (v2)
- **CLI colors** — add `chalk` or `picocolors` for richer terminal output (post-MVP)

## Dependencies to Add
- `typescript` — dev dependency
- `tsx` — run TypeScript directly in dev
- `@types/inquirer` — type definitions

## Requirements Coverage
- REQ-AUTH-01: Login ID + PIN against `teachers`/`directors` tables
- REQ-AUTH-02: Same flow handles both roles
- REQ-AUTH-03: Role determined by which table matched
- REQ-CLI-01: `inquirer` list menu for template selection
- REQ-CLI-02: All UI in Uzbek
- REQ-CLI-03: Uzbek error messages for invalid login, DB errors, empty fields
