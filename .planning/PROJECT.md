# Zunoora — Uzbekistan Teacher Document Assistant

## What This Is
An offline-first desktop application (CLI prototype → Electron) that fully automates document work for Uzbekistan teachers. A teacher types a natural request in Uzbek like *"tushuntirish xati yozing direktor uchun"* and gets a formatted `.docx` document instantly.

## Core Value
Eliminate hours of repetitive document formatting for every Uzbek teacher. Log in, describe what you need, get a print-ready official document.

## Requirements

### Validated
- (none yet — greenfield MVP)

### Active (v1 — CLI MVP)
- **REQ-AUTH-01**: Teacher/director login via Supabase (login ID)
- **REQ-AUTH-02**: Role-based access (teacher vs director views)
- **REQ-TMPL-01**: Fetch document templates from Supabase
- **REQ-TMPL-02**: Support `{{placeholder}}` template syntax
- **REQ-DOC-01**: Generate 8 document types: Ariza, Ish Tabeli, KTP, O'UM, BSB/CHB, Sillabus, Hisobot, Tushuntirish Xati
- **REQ-DOC-02**: Auto-fill known fields (teacher name, school, director, date)
- **REQ-DOC-03**: Interactive field collection for missing data (in Uzbek)
- **REQ-DOC-04**: Export professional `.docx` files (Times New Roman, proper margins)
- **REQ-CLI-01**: Color-coded interactive CLI menu
- **REQ-CLI-02**: Uzbek language interface throughout
- **REQ-OUT-01**: Organized output directory for generated documents

### v2 (Post-MVP — Electron Desktop)
- **REQ-UI-01**: Electron desktop app with GUI
- **REQ-UI-02**: Native file system access for document saving
- **REQ-UI-03**: Conversational Q&A flow (like Zunoora-helps SPA)
- **REQ-UI-04**: Optional AI enhancement (OpenRouter/Groq/OpenAI/Anthropic)
- **REQ-UI-05**: Local template management (add/edit shablons from UI)
- **REQ-SYNC-01**: Offline-first with Supabase sync when online

### Out of Scope
| Feature | Reason |
|---------|--------|
| Mobile app | v1 is CLI + Electron desktop; mobile later |
| Multi-language (Russian/English) | Uzbek-only for v1; teachers work in Uzbek |
| Real-time collaboration | Single-user tool per teacher |
| Cloud sync | Offline-first with optional sync later |

## Context
- Builds on znr-terminal (Node.js CLI prototype) and Zunoora-helps (React SPA prototype)
- Supabase already configured with teachers, directors, schools, shablons tables
- Target users: Uzbekistan school teachers and directors
- Documents follow strict Uzbek Ministry of Education formatting rules

## Constraints
- Must work offline (teachers may have limited internet)
- Must produce `.docx` files compatible with Microsoft Word 2010+
- Uzbek language UI only for v1
- Must be installable on Windows (primary OS in Uzbek schools)

## Key Decisions
- CLI first for rapid prototyping and testing with real users
- Supabase for auth and template storage (already set up)
- `docx` npm library for Word document generation
- Color-coded interactive terminal UI (via `enquirer` or `inquirer`)
- `{{placeholder}}` template syntax (proven in both prototypes)

## Evolution
- 2026-07-05: Project initialized. MVP = CLI tool with all 8 document types.
