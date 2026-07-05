# Zunoora — Project State

## Current Position
- **Milestone:** v1.0 CLI MVP
- **Phase 1:** Executed ✅
- **Phase 2:** Executed ✅
- **Phase 3:** Executed ✅
- **Phase 4:** Executed ✅

## Decisions
- CLI first for rapid prototyping, then Electron desktop
- Supabase for auth + template storage (existing project)
- Build on znr-terminal structure, convert to TypeScript
- Login ID + SHA256 PIN hash auth (MVP)
- All 23 template types in MVP (12 teacher-visible, 11 director-only)
- Hybrid template loading (Supabase + local fallback)
- Role-filtered template lists
- Uzbek language only
- Project name: `zunoora-cli`
- DOCX generation uses `docx` v8 with Times New Roman 14pt, 1.5 line spacing, government-standard margins (left 20mm/1134twips, top 10mm/567twips, right 8mm/454twips, bottom 8mm/454twips)
- Heuristic formatting: school name centered, document headings bold-centered, body justified, signature blocks right-aligned
- Output: flat `output/` folder with `type_teachername_date.docx` naming

## Active Context
- Phase 3 complete: field ordering, validation, director-as-sender, multi-step wizards
- Phase 4 complete: DOCX generation with proper government formatting
- End-to-end flow: login → select → fill → preview → generate DOCX
- TypeScript strict mode, zero errors
- DOCX corruption fixed (2026-07-05): two bugs resolved:
  1. Gerb image path resolved at runtime to `src/assets/gerb.png` (was looking in `dist/assets/`)
  2. ImageRun `transformation` width/height now in pixels (was incorrectly set to EMU values 648000/661500; corrected to 76/78 pixels → ~2cm display at 96 DPI)

## Blockers
- None

## Next Action
Verify with `gsd:verify-work` or move to v2.0 Electron desktop
