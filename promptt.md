# Zunoora Desktop — Electron App Build Specification

> **Purpose of this document:** This is a self-contained build prompt/spec for an AI coding agent (Claude Code or similar) to implement a fully working, click-through Electron.js application shell for **Zunoora** — an AI-powered Uzbek-language document assistant for school teachers. Every interaction described below must actually function (not a static mockup). The visual/UX layer should be production-quality; backend/AI logic can be stubbed with placeholder data where noted.

---

## 1. Product Overview

Zunoora helps Uzbek school teachers generate official documents ("shablon" / templates) — e.g. Yillik Taqvim-Mavzu Reja — through a simple, search-first interface. The desktop app must feel as fast and frictionless as macOS Spotlight, and as clear and guided as a well-designed government form wizard.

**Target output:** a working Electron.js desktop shell, packaged to `.exe`, with the layout and interactions specified below fully wired up (state, navigation, transitions — real UI logic, not placeholder screenshots).

---

## 2. Reference Material — Read This First

Before writing any code, **inspect the existing beta version** located at:

```
D:/ZUNOORAA/vibecodefreak
```

This folder contains an earlier working version of the app (React/Vite + Electron-compatible MVP, Gemini API integration, document preview pane). Treat it as ground truth for:

- Existing component patterns, naming conventions, and file structure already in use.
- The document-fulfillment flow logic already prototyped there (form fields, step sequence, template/shablon handling) — this spec's §4.4 should **extend and refine** that flow's UX, not replace its underlying logic from scratch.
- Any API integration patterns (Gemini/OpenRouter calls, `.docx` export) already wired up, so they can be reused rather than rebuilt.
- Existing design tokens (colors, fonts, spacing) if a Tailwind config or theme file is present — reuse/extend rather than inventing a new visual language.

**Do not blindly copy old UI wholesale** — the layout, sidebar behavior, and search-first flow described in this document take priority over the old version's screens where they conflict. The old folder is for *functional and structural* reference, not a visual source of truth to preserve as-is.

If the folder is unavailable or empty at build time, proceed with this spec alone and flag the gap rather than blocking.

---

## 3. Design Principles (non-negotiable)

1. **Clarity over density.** Every screen must be understandable within 2–3 seconds of first viewing. If a user has to pause and think "what do I do here?", the screen has failed.
2. **Centered, human-scale layouts.** No buttons or bars stretching edge-to-edge. Content lives in the center of the screen in comfortably-sized containers — think A4 paper on a desk, not a dashboard.
3. **One primary action per screen.** Search. Fill. Confirm. Never stack competing calls-to-action.
4. **Motion with purpose.** Animations exist to preserve spatial context (where did this element go?), not for decoration. Every transition described below should be a smooth, eased animation (~250–400ms), not an instant jump-cut.
5. **Progressive disclosure.** The sidebar, settings, and account are always reachable but never demand attention until asked for.

---

## 4. Application States & Flow

### 4.1 Initial Launch State (Home)

- On first app launch, the screen is empty except for:
  - The **search bar**, vertically and horizontally centered on screen (Spotlight-style).
  - The left sidebar, in its **collapsed (icon-only)** state by default (see §5).
- No results, no history, no clutter. This is the calm starting point every session returns to.

### 4.2 Search Bar Behavior

- The search bar is a single, cohesive visual element — not a bar with a separate floating dropdown bolted underneath. As the user types, the results panel should visually read as *part of* the same component (shared border radius, shared shadow, seamless join at the bar's bottom edge).
- As the user types:
  - Example/suggested results appear directly beneath the bar, inside that same unified element, updating live (debounce ~150–200ms).
  - **Above the result list, pinned as the first row**, is a persistent action:
    - A `+` icon on the left
    - Label: **"New shablon"**
    - This is always visible the moment results are showing, regardless of query — it's the escape hatch to start a blank document.
- Empty query + focused state: bar can show recent/frequent shablon suggestions instead of a blank dropdown (empty state should never be a dead end).

### 4.3 Selecting a Result → Transition

- Clicking any search result (or "New shablon") triggers:
  1. The search bar **smoothly animates from center-screen to top-left** of the window (shrinks slightly, becomes a persistent mini search/breadcrumb element there — it does not disappear, it relocates, so the user retains spatial context that search is still available).
  2. The main content area cross-fades / slides in to reveal the **Document Fulfillment View** (§4.4).
- This must be a real, working transition (CSS transform + transition, or Framer Motion), not two separate static screens with no connective motion.

### 4.4 Document Fulfillment View

- The form does **not** occupy the full width of the screen. It renders as a **centered card styled like an A4 page** — fixed aspect ratio, comfortable margins on either side, floating on a neutral background.
- Inside that A4-like card:
  - The document-filling flow lives entirely inside this contained area (fields, steps, preview) — never full-bleed, never edge-to-edge buttons.
  - Users can view/search **past versions** of this document type from within this view (a lightweight version picker — dropdown or small tab strip, not a separate page).
  - Layout must guide the user step-by-step or field-by-field with unambiguous labels, so nothing requires guessing.
- This screen is the most detail-sensitive in the app — treat it as the primary UX deliverable. Prioritize whitespace, clear field grouping, and an obvious path to "done" over visual density.

---

## 5. Left Sidebar (Navigation)

### 5.1 Collapsed vs Expanded

- Behaves like the sidebar in Gemini or Claude's own chat apps: two states, **collapsed (icon rail)** and **expanded (icon + label)**.
- **On first launch, the sidebar starts collapsed.** It only expands when the user explicitly clicks the toggle — never auto-expands.
- State should persist across app restarts (store last-used sidebar state locally).

### 5.2 Logo & Toggle

- Top of sidebar: app logo.
- Directly beneath the logo: a dedicated toggle button that switches the sidebar between collapsed and expanded. This button's position never moves and is present in both states.

### 5.3 History

- Middle section of the sidebar: a list of previously created documents ("History").
- Collapsed state: icon only (e.g. clock/list icon) — clicking expands the sidebar to reveal the full list, or opens a lightweight flyout with the list.
- Expanded state: full list with document titles, most recent first.

### 5.4 Settings

- Fixed near the bottom of the sidebar, **always visible and functional in both collapsed and expanded states** (icon-only when collapsed, icon + label when expanded).
- Opens a settings panel/modal with:
  - **Theme toggle:** Dark / Light.
  - **Language selector:** Uzbek (uz) / Russian (ru) / English (en).
- Changes apply immediately, app-wide, no reload required.

### 5.5 Account

- Bottom-most item in the sidebar: account avatar/icon — **always visible and functional in both collapsed and expanded states.**
- Clicking it opens an **account menu** styled like a Telegram profile card:
  - Teacher's profile info (name, avatar, role/school info placeholder fields).
  - Login and password fields (display/edit, can be stubbed with placeholder state for now).
  - A **Log out** button, styled in **red**, clearly separated from the rest of the menu (e.g. divider above it) so it's never misclicked.

---

## 6. Component Inventory (for implementation)

| Component | States needed |
|---|---|
| `SpotlightSearchBar` | idle (centered), focused/typing (expanded w/ results), docked (top-left, post-selection) |
| `SearchResultsList` | empty, loading, populated, includes pinned `NewShablonAction` row |
| `NewShablonAction` | default, hover, active |
| `DocumentFulfillmentCard` | step/field states, version-picker open/closed |
| `VersionPicker` | closed, open, item list |
| `Sidebar` | collapsed, expanded, transitioning |
| `SidebarToggleButton` | collapsed→expanded, expanded→collapsed |
| `HistoryList` | empty, populated |
| `SettingsPanel` | theme: dark/light, language: uz/ru/en |
| `AccountMenu` | closed, open |
| `LogoutButton` | default, hover, confirm (optional confirmation step) |

---

## 7. Technical Architecture (Electron)

### 7.1 Recommended Stack
- **Shell:** Electron.js (latest stable)
- **Renderer:** React + Vite
- **Styling:** Tailwind CSS
- **Icons:** lucide-react
- **Animation:** Framer Motion (for the search-bar dock transition and sidebar expand/collapse)
- **State management:** Zustand (lightweight, ideal for sidebar/theme/language/search state)
- **i18n:** `i18next` + `react-i18next` with `uz.json`, `ru.json`, `en.json` locale files

### 7.2 Process Architecture
- `main/` — Electron main process: window creation, IPC handlers, app lifecycle, auto-updater hooks (future).
- `preload/` — `contextBridge`-based preload script exposing a minimal, explicit API to the renderer (no direct Node access from renderer).
- `renderer/` (or `src/`) — React app: all UI described above.
- Keep `contextIsolation: true`, `nodeIntegration: false`, `sandbox: true` in `BrowserWindow` config — no exceptions.

### 7.3 State Management
- Global store slices: `searchState`, `sidebarState` (collapsed/expanded, persisted), `themeState` (dark/light, persisted), `languageState` (uz/ru/en, persisted), `historyState`, `accountState`.
- Persist sidebar/theme/language to local storage or a small JSON file via the main process (so state survives app restarts) — do not rely on browser localStorage alone inside a packaged Electron app; prefer `electron-store` or an equivalent main-process-backed store.

### 7.4 Packaging to `.exe`
- Use **electron-builder** with a Windows NSIS target.
- Confirm `package.json` build config includes `"win": { "target": "nsis" }` and appropriate `appId`, `productName`, and icon paths.
- Verify the build runs cleanly with a `npm run build && npm run dist` (or equivalent) pipeline before considering the task complete.

---

## 8. Suggested Folder Structure

```
zunoora-desktop/
├── main/
│   ├── index.js
│   └── ipc/
├── preload/
│   └── index.js
├── src/
│   ├── components/
│   │   ├── SpotlightSearchBar/
│   │   ├── DocumentFulfillmentCard/
│   │   ├── Sidebar/
│   │   ├── SettingsPanel/
│   │   └── AccountMenu/
│   ├── store/
│   ├── locales/
│   │   ├── uz.json
│   │   ├── ru.json
│   │   └── en.json
│   ├── App.jsx
│   └── main.jsx
├── electron-builder.yml
├── vite.config.js
└── package.json
```

---

## 9. Definition of Done

- [ ] App launches with sidebar collapsed and search bar centered.
- [ ] Typing in the search bar shows live example results as one visually unified element.
- [ ] "+ New shablon" row is pinned above results at all times results are visible.
- [ ] Selecting a result (or "New shablon") animates the search bar to top-left and reveals the Document Fulfillment View — no jump-cuts.
- [ ] Document Fulfillment View renders as a centered, A4-proportioned card with no full-width elements.
- [ ] Past versions of a document are viewable/searchable from within the fulfillment view.
- [ ] Sidebar toggles between collapsed/expanded smoothly, state persists across restarts.
- [ ] History, Settings, and Account remain visible and clickable in both sidebar states.
- [ ] Settings panel toggles theme (dark/light) and language (uz/ru/en) live, app-wide.
- [ ] Account menu opens a Telegram-style profile card with login/password fields and a red Logout button.
- [ ] Project builds to a working `.exe` via electron-builder.

---

*This spec is intended to be handed directly to a coding agent as a build prompt. Each numbered section can be tackled as its own implementation task/PR.*
