# Zunoora — Agent Instructions

This project uses the GSD (Get-Shit-Done) workflow system.

## Plan files
- `.planning/PROJECT.md` — vision, core value, constraints
- `.planning/REQUIREMENTS.md` — REQ-IDs with traceability
- `.planning/ROADMAP.md` — phase breakdown
- `.planning/STATE.md` — current position, blockers, next action
- `.planning/phases/` — per-phase artifacts (CONTEXT, PLAN, SUMMARY, VERIFICATION)

## Workflow
1. Start each phase with `gsd:discuss-phase <N>` to clarify implementation decisions
2. Then `gsd:plan-phase <N>` for detailed execution plans
3. Then `gsd:execute-phase <N>` to build
4. Verify with `gsd:verify-work`

## Conventions
- Uzbek language for UI strings and user-facing text
- English for code, comments, and documentation
- All document generation uses `docx` npm library
- Templates use `{{placeholder}}` syntax
- Supabase for auth and template storage
