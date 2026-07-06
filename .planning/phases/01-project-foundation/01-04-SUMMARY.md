# Plan 01-04: App Shell UI — Summary

**Status:** ✅ Complete

## What was built

- **Sidebar component** (`src/renderer/src/components/Sidebar/Sidebar.tsx`):
  - Framer Motion `motion.aside` with spring animation (stiffness 180, damping 26)
  - Animated width: 60px (collapsed) ↔ 260px (expanded) via `useSidebarStore`
  - Brand area: rotated diamond ◆ toggle button + "ZUNOORA" label
  - History section: serif-italic label when expanded, Clock icon when collapsed
  - Bottom actions: New chat (+), Settings (⚙), Account (👤) with hover effects
  - All labels via `useTranslation()` from react-i18next

- **MainStage component** (`src/renderer/src/components/Stage/MainStage.tsx`):
  - Centered idle state: serif-italic "Zunoora" title, subtitle, description
  - `desk-vignette` background effect
  - Responsive max-w-2xl container

- **App.tsx** updated: Sidebar + MainStage in flex layout

- **Aliases**: Added `@renderer` alias to electron.vite.config.ts and tsconfig.web.json

## Key decisions
- Sidebar toggle uses spring animation matching design spec
- History section is placeholder (will be populated in Phase 2/3)
- Bottom buttons (new chat, settings, account) are non-functional placeholders
- Brand toggle uses rotated CSS border diamond, matching design spec

## Build verification
- `npx electron-vite build` — ✅ Passes
