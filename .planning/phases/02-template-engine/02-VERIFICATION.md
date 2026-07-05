# Phase 2 Verification: Template Engine & Document Types

## Goal Achievement Check
**Goal:** Fetch templates from Supabase, implement placeholder engine, define all 23 shablons, role-filtered menu.

## Verification Criteria

### REQ-TMPL-01: Fetch templates from Supabase
- [x] `src/templates.ts` loads from `supabase.from('shablons').select('*')`
- [x] Falls back to local `Blanks/shablons.json` on Supabase failure
- [x] Caches data locally after successful load (write-through)

### REQ-TMPL-02: Placeholder substitution
- [x] `src/renderer.ts` — `{{placeholder}}` → value via `\w+` regex
- [x] Blank line collapsing (3+ → 2)
- [x] Leftover placeholder warning on stderr

### REQ-TMPL-03: JSON schema per template
- [x] Each shablon has `schema.required` and `schema.optional` arrays
- [x] Field names used for display labels and validation

### REQ-DOC-01 through REQ-DOC-08: 8 original types
- [x] All present in Supabase (ariza, ish_tabeli, ktp, oum, bsb_chb, sillabus, hisobot_choraklik, tushuntirish_xati)
- [x] Plus 15 additional templates = 23 total

### Role Filtering
- [x] Migration: `teacher_visible` column added
- [x] Teachers see 12 templates (where `teacher_visible = true`)
- [x] Directors see all 23 templates
- [x] Selection menu shows numbered list with Uzbek labels

### Build Verification
- [x] `npx tsc --noEmit` passes with zero errors

### Flow Verification
- [x] Full loop: login → menu → field prompts → preview → loop/exit

## Status
**PASSED** — All criteria met.
