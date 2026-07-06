# Zunoora Desktop — Roadmap

## Milestone: v1.0 Desktop App

### Phase 1: Project Foundation & App Shell
**Goal:** Electron + React + Vite scaffold with design system applied. App launches with working window, Zustand stores, i18n setup, and the Zunoora dark theme rendered.

**Requirements:** SHELL-01, SHELL-02, SHELL-03, DZN-01 through DZN-08, STATE-01, STATE-02, I18N-01, I18N-02

**Deliverables:**
- Electron-vite project scaffold (main, preload, renderer)
- Package.json with all dependencies (electron, react, tailwind, framer-motion, zustand, i18next, lucide-react)
- Tailwind config with Zunoora design tokens
- Global CSS with custom utilities (paper-noise, desk-vignette, serif-italic)
- Zustand stores with persistence (sidebar, theme, language, search, history, account)
- i18next setup with uz/ru/en locale files
- App shell: sidebar rail (collapsed) + centered empty stage
- Electron security: contextIsolation, nodeIntegration, sandbox
- Preload script with contextBridge API
- Logo integration (logo.jpg as app icon)

**Success Criteria:**
1. App launches showing dark carbon background with collapsed sidebar and centered empty stage
2. Design tokens render correctly (colors, fonts, spacing)
3. Zustand stores persist state across app restarts
4. i18n switches between uz/ru/en (verified by changing language)

---

### Phase 2: Spotlight Search & Transitions
**Goal:** Working Spotlight-style search bar with live results, "+ New shablon" action, and center-to-corner animation.

**Requirements:** SEARCH-01 through SEARCH-07, BUILD-01, BUILD-02, BUILD-03

**Deliverables:**
- `SpotlightSearchBar` component with idle (centered), focused/typing, and docked (top-left) states
- `SearchResultsList` component with empty, loading, and populated states
- `NewShablonAction` row pinned above results
- Live search with debounce (~150-200ms)
- Center-to-top-left animation using Framer Motion (spring: stiffness 180, damping 26)
- Content area cross-fade/slide to reveal Document Fulfillment View placeholder
- electron-builder NSIS config
- Working npm run build && npm run dist pipeline

**Success Criteria:**
1. Search bar is centered on load, transitions to top-left on selection
2. Typing shows results as one visually unified element (shared border/shadow)
3. "+ New shablon" always visible when results are shown
4. Animation is smooth (~250-400ms), not a jump-cut
5. Project builds to NSIS installer successfully

---

### Phase 3: Sidebar & Navigation
**Goal:** Fully functional collapsible sidebar with history list, toggle animation, and persistent state.

**Requirements:** SIDEBAR-01 through SIDEBAR-08

**Deliverables:**
- `Sidebar` component with collapsed (icon rail, 60px) and expanded (260px, icon+label) states
- `SidebarToggleButton` with rotate animation
- Logo at top
- `HistoryList` with most-recent-first ordering
- Smooth expand/collapse animation (Framer Motion, layout animation)
- Sidebar state persisted via Zustand + electron-store
- Framer Motion layout animations for smooth transitions

**Success Criteria:**
1. Sidebar starts collapsed, toggles open on button click
2. Animation is smooth with no layout shift
3. State persists across full app restart
4. All sidebar elements visible and clickable in both states
5. History list renders correctly

---

### Phase 4: Document Fulfillment View
**Goal:** A4-proportioned centered card with step-by-step form flow, version picker, and completion state.

**Requirements:** DOC-01 through DOC-05

**Deliverables:**
- `DocumentFulfillmentCard` component — centered A4-like card with paper texture
- Guided step-by-step field form inside the card
- `VersionPicker` — lightweight dropdown/tab strip for past versions
- Completion/"done" state with clear feedback
- Paper sheet styling (paper-noise, paper-shadow from design spec)
- Spring animation for card entry (stiffness: 160, damping: 24, delay: 0.15s)

**Success Criteria:**
1. Card renders centered with A4 proportions, not full-width
2. Form guides user step-by-step with clear labels
3. Version picker opens and shows past versions
4. Clear "done" state after completion
5. Paper styling matches design spec (texture, shadow, font)

---

### Phase 5: Settings, Account & Polish
**Goal:** Settings panel with theme/language controls, Telegram-style account menu, and final polish before build.

**Requirements:** SETTINGS-01 through SETTINGS-04, ACCT-01 through ACCT-05

**Deliverables:**
- `SettingsPanel` — theme toggle (dark/light), language selector (uz/ru/en) with immediate live updates
- `AccountMenu` — Telegram-style profile card with name, avatar, role/school placeholders, login/password fields
- Red Logout button with separator
- Proper open/close animations for both panels
- All remaining components properly styled per design spec
- Final verification of all v1 requirements

**Success Criteria:**
1. Theme toggle switches between dark and light immediately
2. Language selector changes UI language without reload
3. Account menu opens as Telegram-style card
4. Logout button is red, clearly separated
5. All animations match design spec parameters
6. Final build produces working NSIS installer

---

## Phase Details

**Phase 1: Project Foundation & App Shell**
Requirements: SHELL-01, SHELL-02, SHELL-03, DZN-01 through DZN-08, STATE-01, STATE-02, I18N-01, I18N-02
Success criteria: 5

**Phase 2: Spotlight Search & Transitions**
Requirements: SEARCH-01 through SEARCH-07, BUILD-01, BUILD-02, BUILD-03
Success criteria: 5

**Phase 3: Sidebar & Navigation**
Requirements: SIDEBAR-01 through SIDEBAR-08
Success criteria: 5

**Phase 4: Document Fulfillment View**
Requirements: DOC-01 through DOC-05
Success criteria: 5

**Phase 5: Settings, Account & Polish**
Requirements: SETTINGS-01 through SETTINGS-04, ACCT-01 through ACCT-05
Success criteria: 6
