# Requirements: Zunoora Desktop

**Defined:** 2026-07-06
**Core Value:** Eliminate repetitive document formatting for Uzbek teachers. Search, fill, export — in under a minute.

## v1 Requirements

### App Shell

- [ ] **SHELL-01**: Electron desktop app launches with proper window config (title, icon, dimensions, security)
- [ ] **SHELL-02**: App starts with sidebar collapsed and search bar centered on screen
- [ ] **SHELL-03**: Zustand stores initialized with persisted slices for sidebar, theme, language, search, history

### Spotlight Search

- [ ] **SEARCH-01**: Search bar appears vertically and horizontally centered in idle state
- [ ] **SEARCH-02**: Search bar and results render as one visually unified element (shared border, shadow, seamless join)
- [ ] **SEARCH-03**: Typing shows live suggested results with ~150-200ms debounce
- [ ] **SEARCH-04**: "+ New shablon" row is pinned above all results whenever results are visible
- [ ] **SEARCH-05**: Empty query + focused state shows recent/frequent shablon suggestions
- [ ] **SEARCH-06**: Clicking a result triggers smooth animation: search bar transitions from center to top-left
- [ ] **SEARCH-07**: Content area cross-fades/slides to reveal Document Fulfillment View after selection

### Sidebar & Navigation

- [ ] **SIDEBAR-01**: Sidebar has two states: collapsed (icon-only rail) and expanded (icon + label)
- [ ] **SIDEBAR-02**: Sidebar starts collapsed on first launch
- [ ] **SIDEBAR-03**: Toggle button at top switches between collapsed/expanded with smooth animation
- [ ] **SIDEBAR-04**: Sidebar state persists across app restarts (electron-store or main process)
- [ ] **SIDEBAR-05**: History list in sidebar shows previously created documents (most recent first)
- [ ] **SIDEBAR-06**: Settings icon always visible and functional in both sidebar states
- [ ] **SIDEBAR-07**: Account avatar/icon always visible and functional in both sidebar states
- [ ] **SIDEBAR-08**: Logo at top of sidebar

### Document Fulfillment View

- [ ] **DOC-01**: Renders as centered A4-proportioned card with comfortable margins
- [ ] **DOC-02**: Form fills the card — never full-bleed or edge-to-edge
- [ ] **DOC-03**: Step-by-step or field-by-field guided layout with clear labels
- [ ] **DOC-04**: Version picker within the view to view/search past versions of same document type
- [ ] **DOC-05**: Clear path to completion ("done" state)

### Settings

- [ ] **SETTINGS-01**: Settings panel opens from sidebar
- [ ] **SETTINGS-02**: Theme toggle switches between Dark and Light mode
- [ ] **SETTINGS-03**: Language selector switches between Uzbek (uz), Russian (ru), English (en)
- [ ] **SETTINGS-04**: All settings changes apply immediately app-wide without reload

### Account

- [ ] **ACCT-01**: Account menu opens from sidebar bottom (Telegram-style profile card)
- [ ] **ACCT-02**: Shows teacher profile info (name, avatar, role/school placeholders)
- [ ] **ACCT-03**: Login and password fields (display/edit, stubbable)
- [ ] **ACCT-04**: Red Logout button clearly separated from rest of menu
- [ ] **ACCT-05**: Account menu has proper open/close animation

### Build & Distribution

- [ ] **BUILD-01**: Project builds to NSIS installer via electron-builder
- [ ] **BUILD-02**: Win target configured with appId, productName, icon
- [ ] **BUILD-03**: npm run build && npm run dist pipeline works cleanly

### Design System

- [ ] **DZN-01**: Apply carbon theme colors from Zunoora design spec
- [ ] **DZN-02**: Apply typography (Inter + Times New Roman) from design spec
- [ ] **DZN-03**: Apply spacing system from design spec
- [ ] **DZN-04**: Apply border radius system from design spec
- [ ] **DZN-05**: Apply shadow system from design spec
- [ ] **DZN-06**: Apply animation configs (spring stiffness/damping) from design spec
- [ ] **DZN-07**: Apply custom CSS utilities (paper-noise, desk-vignette, serif-italic)
- [ ] **DZN-08**: Use lucide-react icons with proper stroke widths

### State Management & i18n

- [ ] **STATE-01**: Zustand store slices for search, sidebar, theme, language, history, account
- [ ] **STATE-02**: Persisted slices via electron-store or main process
- [ ] **I18N-01**: i18next configured with uz.json, ru.json, en.json locale files
- [ ] **I18N-02**: Full UI in Uzbek for v1 with Russian and English available

## v2 Requirements

### Backend & AI Integration

- **AI-01**: OpenRouter/Groq/OpenAI/Anthropic integration for smart field suggestions
- **AI-02**: AI-powered document formatting improvement
- **AI-03**: Smart shablon type detection from natural language input

### Offline & Sync

- **SYNC-01**: Cache templates and data locally for offline use
- **SYNC-02**: Sync changes to Supabase when online
- **SYNC-03**: Work fully offline with cached data

### Template Management

- **TMGMT-01**: In-app template management (add/edit/delete shablons from UI)

## Out of Scope

| Feature | Reason |
|---------|--------|
| Mobile app | Post-v2, desktop only for now |
| Real-time collaboration | Single-user tool per teacher |
| Full AI backend integration | Stubbed for v1, full AI in v2 |
| Cloud sync | v2 feature |

## Traceability

| Requirement | Phase | Status |
|---|---|---|
| SHELL-01, SHELL-02, SHELL-03 | Phase 1 | Pending |
| DZN-01 through DZN-08 | Phase 1 | Pending |
| STATE-01, STATE-02 | Phase 1 | Pending |
| I18N-01, I18N-02 | Phase 1 | Pending |
| SEARCH-01 through SEARCH-07 | Phase 2 | Pending |
| BUILD-01, BUILD-02, BUILD-03 | Phase 2 | Pending |
| SIDEBAR-01 through SIDEBAR-08 | Phase 3 | Pending |
| DOC-01 through DOC-05 | Phase 4 | Pending |
| SETTINGS-01 through SETTINGS-04 | Phase 5 | Pending |
| ACCT-01 through ACCT-05 | Phase 5 | Pending |

**Coverage:**
- v1 requirements: 38 total
- Mapped to phases: 38
- Unmapped: 0 ✓

---

*Requirements defined: 2026-07-06*
*Last updated: 2026-07-06 after initial definition*
