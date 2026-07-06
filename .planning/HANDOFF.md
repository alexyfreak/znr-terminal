# Zunoora Desktop — GSD Handoff

## Project
- **App:** Zunoora Desktop — Uzbek teacher document assistant
- **Stack:** Electron + React 19 + TypeScript + Tailwind v4 + Framer Motion + Zustand + i18next
- **Build:** electron-vite → electron-builder NSIS (Zunoora.exe)
- **Dir:** `D:\Dizaynn`
- **Run:** `npm run dev`
- **Build:** `npm run build && npm run package:win`

## Architecture

```
electron/
  main/index.ts          BrowserWindow, contextIsolation
  preload/index.ts       contextBridge API
src/renderer/src/
  App.tsx                Root shell (sidebar + search + fulfillment + panels)
  main.tsx               React entry + i18n import
  styles/globals.css     Tailwind v4 @theme + Zunoora design tokens
  i18n/config.ts         i18next setup (uz/ru/en)
  locales/               uz.json, ru.json, en.json
  store/                 6 Zustand stores (sidebar, theme, lang, search, history, account)
  types/electron.d.ts    window.electronAPI types
  components/
    Sidebar/             Collapsible sidebar (60↔260px) with HistoryList
    Stage/MainStage      Centered brand content
    Search/              SpotlightSearchBar + SearchResultsList + NewShablonAction
    DocumentFulfillmentCard/  A4 paper card with 3-step form
    FieldCollector/      Step-by-step field form with validation
    VersionPicker/       Version dropdown
    SettingsPanel/       Theme + language dialog
    AccountMenu/         Telegram-style profile card
build/icon.png           App icon (256x256 PNG)
build/icon.ico           Windows icon
electron-builder.json    NSIS config (allowToChangeInstallationDirectory)
```

## State Management
| Store | Persisted | Key Fields |
|---|---|---|
| useSidebarStore | localStorage | isExpanded, toggle |
| useThemeStore | localStorage | theme (dark/light) |
| useLanguageStore | localStorage | language (uz/ru/en) |
| useSearchStore | No (ephemeral) | query, isFocused, isDocked, results |
| useHistoryStore | localStorage | items[] |
| useAccountStore | localStorage | isLoggedIn, userName, schoolName, role |

## Component Flow
1. **Launch** → Sidebar (collapsed) + MainStage (centered Zunoora brand)
2. **Focus search** → Brand stays, search bar shows results (unified element)
3. **Type** → Debounced mock results appear (letter-based: y→Yillik, d→Dars...)
4. **Select result** → Search bar animates to top-left corner, content cross-fades to DocumentFulfillmentCard
5. **Fill form** → 3 steps with progress bar, validation, date checking
6. **Done** → Completion state with export stub (placeholder)
7. **New chat** → Resets to home state
8. **Sidebar buttons** → Settings (theme/language dialog) | Account (login/logout card)
| Known Bugs & Issues

All documented in `.planning/BUGS.md`.

## Git Log (15 commits)
```
b6de82e feat(05): settings panel + account menu
9da4e24 fix: wire doc fulfillment reset flow
194f6a6 feat(04): doc fulfillment — A4 card, 3-step form
4c4afce docs: mark Phase 3 complete
fc77ab7 feat(03): sidebar — HistoryList + diamond rotate
c69037c fix: center search bar + smooth focus
d0b5b11 docs: mark Phase 2 complete
2f30851 feat(02): spotlight search + animation + build pipeline
476bc50 docs: mark Phase 1 complete
878cfba feat(01-04): app shell UI
63045c2 feat(01-02,01-03): design system + stores + i18n
395d46d feat(01-01): scaffold
```

## GSD Command

To fix all bugs and test the whole app in a fresh session, run:

```
/gsd:audit-fix --severity all --max 10
```

Then for professional testing:

```
/gsd:audit-uat
```

Or use the standalone tester command to load this handoff:

```
Read D:\Dizaynn\.planning\HANDOFF.md
Read D:\Dizaynn\.planning\BUGS.md
Read D:\Dizaynn\.planning\TEST-PLAN.md
Then: run /gsd:code-review on all source files, fix all findings, run /gsd:verify-work to UAT every feature
```

## Key Files for Debugging
| Issue | File |
|---|---|
| Search bar animation | `src/renderer/src/components/Search/SpotlightSearchBar.tsx` |
| Search ↔ brand overlap | `src/renderer/src/App.tsx` + `src/renderer/src/components/Stage/MainStage.tsx` |
| Docked search overlap | `src/renderer/src/App.tsx` (pt-16 on fulfillment container) |
| Fulfillment export stub | `src/renderer/src/components/DocumentFulfillmentCard/DocumentFulfillmentCard.tsx` |
| layoutId transition | `src/renderer/src/components/Search/SpotlightSearchBar.tsx` (fixed vs relative) |
| Build icon WASM crash | `build/icon.ico` (pre-generated to avoid electron-builder WASM bug) |
