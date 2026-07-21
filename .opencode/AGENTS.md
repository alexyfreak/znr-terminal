# Zunoora Desktop — Project Context

## Project
Electron + React 19 + TypeScript + Supabase desktop app for Uzbek teachers to generate official school documents (shablons).

## Structure
```
electron/main/          # Electron main process (IPC handlers, auth, DB, DOCX, payment)
  auth.ts               # scrypt-based auth (teacher/director roles), register/login
  db.ts                 # Supabase client init + TS types
  docx.ts               # DOCX generation via docx.js library
  templates.ts          # Template CRUD (create/read/update/delete, marketplace)
  renderer.ts           # Template rendering (variable substitution)
  payment.ts            # Payme/Click payment gateway integration
  ipc-handlers.ts       # IPC bridge (auth, templates, docx, store, payment)
  ipc-wrapper.ts        # Safe handler wrapper (error handling)
  errors.ts             # Global error handlers
  index.ts              # App entry — BrowserWindow 1200x800, DevTools toggle
electron/preload/       # Context-bridge for renderer
src/renderer/src/       # React app
  components/           # UI components
    AuthScreen/         # Login/register
    DocumentEditor/     # DOCX preview + variable fields
    Search/             # Spotlight search (Cmd+K)
    SettingsPanel/      # App settings
    ShablonBuilder/     # Visual template builder (steps, fields, metadata)
    Sidebar/            # Navigation + history
    AccountMenu/        # User menu
    AiHelperPanel.tsx   # AI assistant
    BugReport/          # Error reporting
    PaymentCheckout.tsx # Payment UI
    PricingPage.tsx     # Pricing/subscription
    CreditBalanceBadge.tsx
    BuyCreditsPage.tsx
  store/                # Zustand stores
  i18n/                 # en.json, ru.json, uz.json
  locales/
  styles/               # Tailwind globals
  types/                # TS type definitions
  utils/                # fieldLabels.ts, ipc.ts
```

## Database (Supabase)
Tables: schools, teachers, directors, classes, shablons (templates), user_shablons
Auth: TCH00001 / 1234 (default test user, teacher role)
Credentials in .env: SUPABASE_URL, SUPABASE_ANON_KEY

## Payment
Payme (Uzbekistan) + Click (Uzbekistan) gateways via JSON-RPC / REST.
Config: PAYME_ID, PAYME_KEY, CLICK_SERVICE_ID, CLICK_MERCHANT_ID, CLICK_SECRET_KEY

## Stack
- Electron 43 + electron-vite + electron-builder (NSIS for Windows)
- React 19 + TypeScript 5.5 + Tailwind CSS 4
- Zustand (state), Lucide+Phosphor (icons), Framer Motion (animations)
- i18next (uz/ru/en), docx.js (DOCX gen), Supabase (backend)
- shadcn/ui + Radix UI primitives, CVA + clsx + tailwind-merge

## Key Config Files
- electron.vite.config.ts — Vite config for main/preload/renderer
- electron-builder.json — Windows NSIS packaging
- components.json — shadcn config
- opencode.json — opencode MCP + compaction settings

## Token-Saving Rules
1. Keep this AGENTS.md under 500 lines. Prefer grep/glob over full file reads.
2. Route `npm test`, `npm run build` output to files: `cmd > out.log`
3. Use `offset`+`limit` for partial file reads. Prefer partial reads over full.
4. Run `/compact` at logical breakpoints. Do not extend past 3 auto-compactions.
5. Limit MCP servers to only essential ones (< 7, each costs 2K-5K tokens).
6. Don't re-read files already in context.
7. Use memory files for decisions instead of re-explaining.
8. `opencode.json` already has compaction: auto + prune + reserved 8000 tokens.

## Design System
Monochrome design system. SKILL.md in root has full brand specs (colors, typography, radius, components).
Page bg #0A0A0A, surface #131313, elevated #181818, text #EDEDED.
Serif (Newsreader) for document content, Sans (Inter) for app chrome.
Tailwind config with zn-* theme variables.
