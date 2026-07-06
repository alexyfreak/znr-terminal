# Phase 2 GSD Prompt

## Goal
Make the left sidebar chat history functional (real tracking, filtering, deletion),
re-theme the document fulfillment area to match the rest of the UI (dark/light),
add select/dropdown inputs to FieldCollector where data choices exist,
and make the entire layout responsive to all screen sizes.

## Context
- Electron + React 19 + TypeScript + Tailwind v4 + Zustand + framer-motion
- Supabase connected, auth works, 23 shablons load after login
- `useHistoryStore` persists items (id, title, type, date, docCount) with addItem/removeItem/setItems/clear
- `useAccountStore` persists login state (isLoggedIn, userName, schoolName, role)
- IPC channels: `auth:login`, `tpl:list`, `docx:generate`, `dialog:save`, `store:get`, `store:set`
- Templates have `type`, `label`, `description`, `schema: { required, optional }`, `template` string, `keywords`, `teacher_visible`

## User Stories

### 1. Chat History — Real & Filterable
- After a document is generated (docx export completes), push a history entry to useHistoryStore with the template label, date, type
- Add sort toggle in sidebar: "Newest" / "Oldest" — reorders history items by date
- Show relative dates (e.g. "2 min ago", "Yesterday", "Mar 15") in the history list
- Empty state shows different message when logged in vs not

### 2. Chat Deletion
- Each history item has a delete button (X or trash icon) on hover
- Delete calls useHistoryStore.removeItem(id) with confirmation or undo
- Animate item removal (exit animation already exists in HistoryList)

### 3. Document Fulfillment — Theme-Consistent
- Replace bg-[var(--paper-bg)] text-[var(--paper-text)] with bg-[var(--surface)] text-foreground in DocumentFulfillmentCard for all views (fields, preview, done)
- Preview pane: replace bg-white border-gray-200 with bg-[var(--surface)] border-[var(--hairline)]
- All buttons: use theme color tokens instead of hardcoded bg-blue-600 text-white — use bg-[var(--warm)]/10 text-foreground border-[var(--hairline)] pattern from rest of UI
- Export done view: use bg-[var(--surface)] instead of bg-green-50 / bg-red-50
- Verify against both dark (default) and light themes — toggle in settings

### 4. Smart Inputs — Select/Dropdown
- Pass the logged-in user's context (school, classes, teacher data) from App.tsx down to FieldCollector
- FieldCollector: for known reference fields, render <select> instead of <input>:
  - school → show current school name (read-only or single-option select)
  - class_name / classes → show class list from context (from Supabase classes table)
  - subject → use the teacher's subject field, or show all known subjects
  - academic_year → show current/next year options
- Use useAccountStore data + IPC to get available options where applicable
- When no options available for a field, fall back to text <input>

### 5. Responsive Layout
- Sidebar: collapsible icon-only mode already exists, ensure it works on narrow widths
- Main content area: no hardcoded max-w-[640px] on fulfillment card — use max-w-2xl or percentage-based sizing
- Search bar: ensure max-w-xl adapts on smaller viewports (use w-full max-w-xl already done, verify)
- Account/Settings panels: ensure they don't overflow on short viewports (scrollable)
- Test at 1024x768, 1280x800, 1920x1080 — no horizontal scroll, no clipping

## Constraints
- Keep Zustand stores (no Redux/Context)
- Use Tailwind v4 utility classes + CSS custom properties (var(--xxx)) for theming
- Keep framer-motion for animations
- Follow existing code patterns (inline Template interface in component files)
- All new IPC calls go through electron/preload/index.ts bridge
- History store persists to localStorage (zustand-persist already set up)
- Text labels in Uzbek (uz.json locale)

## Files to Change
- src/renderer/src/components/Sidebar/Sidebar.tsx — add sort toggle
- src/renderer/src/components/Sidebar/HistoryList.tsx — add delete button, sort display
- src/renderer/src/store/useHistoryStore.ts — add sort/filter methods if needed
- src/renderer/src/components/DocumentFulfillmentCard/DocumentFulfillmentCard.tsx — re-theme, remove hardcoded colors
- src/renderer/src/components/FieldCollector/FieldCollector.tsx — add select dropdowns, accept context data
- src/renderer/src/App.tsx — pass context data to FieldCollector, save history on doc generate
- src/renderer/src/store/useAccountStore.ts — may need to extend with classes/subjects data
