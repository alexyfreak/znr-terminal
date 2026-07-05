# Phase 2: Template Engine & Document Types — Context

## Domain
Fetch templates from Supabase (with local JSON fallback), implement placeholder engine, define all 23 shablon types with schemas, and build role-filtered template selection menu.

## Canonical Refs
- `src/db.ts` — existing Shablon type, Supabase client
- `D:\ZUNOORAA\shablon-filler\src\menu.js` — existing template menu (base)
- `D:\ZUNOORAA\shablon-filler\src\renderer.js` — existing placeholder renderer (base)
- `D:\ZUNOORAA\shablon-filler\src\collector.js` — existing field collection (base for schema ref)
- `.planning/REQUIREMENTS.md` — REQ-TMPL-01 through REQ-TMPL-03, REQ-DOC-01 through REQ-DOC-08
- Supabase `shablons` table — 23 templates with type, label, description, keywords, schema, template

## Codebase Context
- Supabase `shablons` table has 23 rows, each with: type, label, description, keywords[], schema {required[], optional[]}, template (text with {{placeholders}})
- Existing `menu.js` loads shablons from Supabase, displays in inquirer list, returns selected shablon
- Existing `renderer.js` does `template.replace(/{{(\w+)}}/g, ...)` — strict `\w+` pattern, warns on leftover placeholders, collapses blank lines
- Existing `collector.js` auto-fills 19 field names from context, prompts required/optional fields with Uzbek labels
- Types already defined in `src/db.ts`: `Shablon` interface

## Decisions

### Template Count
- **All 23 templates** from Supabase — not just the original 8
- These cover: Ariza, BSB/CHB, Buyruq (asosiy), Buyruq (kadr), Dalolatnoma, Dars jadvali, Elektron sinf jurnali, Hisobot (choraklik), Ish Tabeli, KTP, Mehnat shartnomasi, O'UM, O'quvchining shaxsiy delosi, Ota-onalar majlisi bayoni, Pedagogik kengash bayoni, Qoldirilgan darslar reyestri, Shahodatnoma reyestri, Sillabus, Tarif-malaka varaqasi, Tavsifnoma, Tushuntirish xati, Ustama buyrug'i, Yillik hisobot

### Template Source Strategy
- **Primary**: Load from Supabase `shablons` table
- **Fallback**: If Supabase is unreachable, load from local `Blanks/shablons.json`
- **Sync**: On successful Supabase load, cache the data locally to `Blanks/shablons.json` (write-through cache)
- This enables offline use after first successful load

### Role-Based Filtering
- **Teachers** see: Ariza, BSB/CHB, Ish Tabeli, KTP, O'UM, Sillabus, Hisobot, Tushuntirish Xati, Dars jadvali, Ota-onalar majlisi bayoni, Tavsifnoma, Qoldirilgan darslar reyestri
- **Directors** see all 23 (full admin access including buyruqlar, tarif, shahodatnoma, etc.)
- Role filter implemented as a `teacher_visible` boolean or a role-based keyword/category on each shablon

### Template Engine
- Port existing `renderer.js` to TypeScript: `src/renderer.ts`
- Keep `{{placeholder}}` `\w+` pattern, blank line collapsing, leftover warning
- No changes to the engine logic — it's proven

### Menu Implementation
- Port existing `menu.js` to TypeScript: `src/menu.ts`
- Keep inquirer list with numbered items
- Cache/fallback logic: try Supabase → on failure, load local → on both failure, exit with Uzbek error
- Apply role filter before displaying

### Template Data
- All 23 templates are already defined in Supabase with proper schemas
- No need to create or modify templates in this phase — just load and use them
- Local fallback: dump all shablons to `Blanks/shablons.json` as cache

### Dependencies
- No new npm packages needed (using existing `dotenv` and `@supabase/supabase-js`)
- New file: `Blanks/` directory for local cache

## Deferred Ideas
- Admin UI for managing templates (v2 Electron feature)
- Template versioning / change history (future)
- Template preview in terminal (post-MVP)

## Requirements Coverage
- REQ-TMPL-01: Fetch templates from Supabase `shablons` table with local fallback
- REQ-TMPL-02: `{{placeholder}}` → value substitution via existing renderer pattern
- REQ-TMPL-03: JSON schema with `required`/`optional` fields per template
- REQ-DOC-01 through REQ-DOC-08: All 8 original types + 15 more = 23 total
- REQ-CLI-01: Inquirer list menu for template selection (ported)
- REQ-CLI-02: Uzbek labels throughout menu
