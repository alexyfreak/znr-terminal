# Zunoora — Requirements

## Core Value
Eliminate hours of repetitive document formatting for every Uzbek teacher.

## v1 Requirements (CLI MVP)

### Authentication
- [ ] REQ-AUTH-01: Teacher can log in via login ID (8 symbols) against Supabase `teachers` table
- [ ] REQ-AUTH-02: Director can log in via login ID against Supabase `directors` table
- [ ] REQ-AUTH-03: System detects role and shows role-appropriate templates and data

### Template Engine
- [ ] REQ-TMPL-01: Fetch document templates from Supabase `shablons` table
- [ ] REQ-TMPL-02: Support `{{placeholder}}` variable substitution syntax
- [ ] REQ-TMPL-03: Support JSON schema defining `required` and `optional` fields per template

### Document Types (all 8)
- [ ] REQ-DOC-01: Ariza (formal application) — recipient, sender, reason, date
- [ ] REQ-DOC-02: Ish Tabeli (work schedule) — teacher, subject, classes, week range
- [ ] REQ-DOC-03: KTP (calendar-thematic plan) — teacher, subject, class, academic year
- [ ] REQ-DOC-04: O'UM (educational-methodological complex) — teacher, subject, class, academic year
- [ ] REQ-DOC-05: BSB/CHB (summative assessment) — teacher, subject, class, quarter
- [ ] REQ-DOC-06: Sillabus (syllabus) — teacher, subject, class, academic year, goals
- [ ] REQ-DOC-07: Hisobot (report) — teacher, subject, period, academic year
- [ ] REQ-DOC-08: Tushuntirish Xati (explanatory letter) — recipient, sender, topic, explanation, date

### Auto-fill & Field Collection
- [ ] REQ-DOC-09: Auto-fill known fields from teacher profile (name, position, subject, school)
- [ ] REQ-DOC-10: Auto-fill school director name from `directors` table
- [ ] REQ-DOC-11: Auto-fill today's date and current academic year
- [ ] REQ-DOC-12: Interactive prompt (in Uzbek) for each missing required field
- [ ] REQ-DOC-13: Display filled template preview before generation

### Document Export
- [ ] REQ-DOC-14: Generate `.docx` files with Times New Roman, proper margins, centered headings
- [ ] REQ-DOC-15: Save generated documents to organized `output/` directory
- [ ] REQ-DOC-16: Filename includes document type, teacher name, and date

### CLI Interface
- [ ] REQ-CLI-01: Color-coded interactive menu (template selection)
- [ ] REQ-CLI-02: Uzbek language prompts and labels throughout
- [ ] REQ-CLI-03: Clear error messages for invalid login, missing fields, etc.

## v2 Requirements (Electron Desktop)

### UI
- [ ] REQ-UI-01: Electron desktop app window with GUI
- [ ] REQ-UI-02: Native file system dialog for save location
- [ ] REQ-UI-03: Conversational Q&A interface for field collection
- [ ] REQ-UI-04: Document preview pane with rendered template
- [ ] REQ-UI-05: Local template management UI (add/edit shablons)

### AI Enhancement
- [ ] REQ-UI-06: Optional AI enhancement via OpenRouter / Groq / OpenAI / Anthropic
- [ ] REQ-UI-07: AI-powered document formatting improvement
- [ ] REQ-UI-08: Smart shablon type detection from natural language input

### Offline & Sync
- [ ] REQ-SYNC-01: Cache templates and data locally for offline use
- [ ] REQ-SYNC-02: Sync changes to Supabase when online
- [ ] REQ-SYNC-03: Work fully offline with cached data

## Out of Scope
| Feature | Reason |
|---------|--------|
| Mobile app | Post-v2 |
| Multi-language | Uzbek only for now |
| Real-time collaboration | Single-user tool |
| Cloud sync | Offline-first with optional sync |

## Traceability

| Requirement | Phase |
|-------------|-------|
| REQ-AUTH-01, REQ-AUTH-02, REQ-AUTH-03 | Phase 1 |
| REQ-TMPL-01, REQ-TMPL-02, REQ-TMPL-03 | Phase 2 |
| REQ-DOC-01 through REQ-DOC-08 | Phase 2 |
| REQ-DOC-09 through REQ-DOC-13 | Phase 3 |
| REQ-DOC-14, REQ-DOC-15, REQ-DOC-16 | Phase 4 |
| REQ-CLI-01, REQ-CLI-02, REQ-CLI-03 | Phase 1 |
| REQ-UI-01 through REQ-UI-08 | v2 |
| REQ-SYNC-01, REQ-SYNC-02, REQ-SYNC-03 | v2 |

## Coverage Summary
- v1 Requirements: 19
- v2 Requirements: 11
- Out of Scope: 4
