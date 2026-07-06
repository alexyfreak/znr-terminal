# Zunoora Desktop

## What This Is

A desktop application (Electron + React) for Uzbek school teachers to generate official government documents ("shablons"). Features a Spotlight-style search interface, a collapsible sidebar, and an A4-proportioned document fulfillment view. Teachers search for a document type, fill in fields in a guided form, and export a professionally formatted `.docx` file.

## Core Value

Eliminate repetitive document formatting for Uzbek teachers. Search, fill, export — in under a minute.

## Requirements

### Validated

(None yet — ship to validate)

### Active

- **SHELL-01**: Electron desktop app launches with proper window configuration
- **SHELL-02**: App starts with sidebar collapsed and search bar centered
- **SEARCH-01**: Search bar appears centered on screen (Spotlight-style) in idle state
- **SEARCH-02**: Typing shows live example results as one visually unified element
- **SEARCH-03**: "+ New shablon" row is pinned above results at all times
- **SEARCH-04**: Selecting a result animates search bar to top-left and reveals Document Fulfillment View
- **SIDEBAR-01**: Sidebar toggles between collapsed (icon-only) and expanded (icon+label)
- **SIDEBAR-02**: Sidebar state persists across app restarts
- **SIDEBAR-03**: History list shows previously created documents
- **SIDEBAR-04**: Settings and Account always visible in both sidebar states
- **DOC-01**: Document Fulfillment View renders as centered A4-proportioned card
- **DOC-02**: Guided field-by-field form inside the A4 card
- **DOC-03**: Past versions viewable/searchable from within fulfillment view
- **SETTINGS-01**: Settings panel with theme toggle (Dark/Light)
- **SETTINGS-02**: Settings panel with language selector (uz/ru/en)
- **SETTINGS-03**: Theme and language changes apply immediately app-wide
- **ACCT-01**: Account menu opens Telegram-style profile card
- **ACCT-02**: Logout button styled in red, clearly separated
- **BUILD-01**: Project builds to working `.exe` via electron-builder NSIS
- **BUILD-02**: All state management via Zustand with persisted slices
- **BUILD-03**: i18n via i18next with uz/ru/en locale files
- **DZN-01**: Apply Zunoora design system (carbon theme, warm accent, typography) from `zunoora-design/` spec

### Out of Scope

- Mobile app — Desktop only for v1
- Real-time collaboration — Single-user tool per teacher
- Backend/AI logic — Stubbed with placeholder data; full integration deferred
- Cloud sync — Offline-first with optional sync later

## Context

- Build spec at `promptt.md` — complete interaction and component specification
- Design system at `zunoora-design/ZUNOORA-DESIGN-SPEC.md` — full color palette, typography, spacing, component states
- Beta codebase at `D:/ZUNOORAA/vibecodefreak` — reference for existing patterns, template engine, document generation, Supabase integration, and IPC architecture
- Logo at `logo.jpg`
- Target users: Uzbekistan school teachers and directors
- Documents follow strict Uzbek Ministry of Education formatting rules

## Constraints

- **Tech stack**: Electron + React + Vite + Tailwind CSS + Framer Motion + Zustand + i18next + lucide-react
- **Security**: contextIsolation: true, nodeIntegration: false, sandbox: true
- **Format**: Must produce `.docx` compatible with Microsoft Word 2010+
- **OS**: Windows primary target (NSIS installer)
- **Design**: Must match the Zunoora design system exactly (colors, typography, spacing, animations)

## Key Decisions

| Decision | Rationale | Outcome |
|---|---|---|
| New design vs reuse beta UI | promptt.md specifies a complete redesign with search-first flow | — Pending |
| Build from spec + copy beta patterns | Beta has working template engine, doc generation, IPC — reuse patterns, not UI | — Pending |

---

*Last updated: 2026-07-06 after initialization*
