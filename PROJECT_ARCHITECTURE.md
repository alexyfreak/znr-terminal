# Project Architecture: Zunoora Dual-Platform System

## Overview
Zunoora operates as two interconnected applications:
- **Desktop App**: Electron-based document generation tool for teachers (1200x800 window)
- **WebApp**: React-based Telegram WebApp for parent-teacher workflows

## System Diagram
```
┌─────────────────────────────────────────────────────────────┐
│                        Zunoora Platform                        │
├──────────────────────────┬────────────────────────────────────┤
│   Desktop Application    │          Web Application           │
├──────────────────────────┼────────────────────────────────────┤
│ Electron 43              │ React 19 + Vite 7                  │
│ React 19 + TypeScript    │ TypeScript 5.5                     │
│ Tailwind CSS v4          │ Tailwind CSS v4                    │
│ docx.js (DOCX gen)       │ Supabase JS Client                 │
│ Supabase JS Client       │ Telegram WebApp API                │
│ Zustand state mgmt       │ Zustand state mgmt                │
└──────────────────────────┴────────────────────────────────────┘
                              │
┌─────────────────────────────┴────────────────────────────┐
│                    Supabase Backend                      │
│  ┌──────────────┐  ┌────────────┐  ┌───────────────┐  │
│  │   PostgreSQL │  │  Realtime  │  │    Storage    │  │
│  │     + RLS    │  │   Pub/Sub  │  │   (Files)     │  │
│  └──────────────┘  └────────────┘  └───────────────┘  │
└──────────────────────────────────────────────────────────┘
```

## Technology Stack

### Desktop App (Electron)
- **Runtime**: Electron 43.0.0
- **Build**: electron-vite 5.0.0
- **Package**: electron-builder 26.15.3 (NSIS for Windows)
- **Window**: 1200x800, DevTools enabled
- **Entry**: `electron/main/index.ts`
- **Preload**: `electron/preload/index.ts`
- **UI**: React 19 + TypeScript + Tailwind CSS v4

### WebApp (Vite)
- **Runtime**: React 19
- **Build**: Vite 7.3.6
- **Host**: Vercel
- **UI**: Same tech stack as desktop for component reuse
- **Entry**: `webapp/src/main.tsx`

### Shared Libraries
- **State Management**: Zustand 5.0.14
- **Styling**: Tailwind CSS v4 + shadcn/ui
- **Icons**: Lucide React + Phosphor Icons
- **I18n**: i18next (uz/ru/en support)
- **Charts**: Recharts
- **Animation**: Framer Motion

## Directory Structure

### Desktop App
```
/home/alexy/zunosh/
├── electron/                 # Electron main process
│   ├── main/                # Main process source
│   │   ├── auth.ts          # Scrypt-based authentication
│   │   ├── db.ts            # Supabase client init
│   │   ├── docx.ts          # DOCX generation logic
│   │   ├── templates.ts     # Template CRUD
│   │   ├── renderer.ts      # Template variable substitution
│   │   ├── payment.ts       # Payme/Click gateways
│   │   ├── ipc-handlers.ts  # IPC bridge handlers
│   │   ├── ipc-wrapper.ts   # Safe handler wrapper
│   │   ├── errors.ts        # Error handling
│   │   └── index.ts         # App entry point
│   └── preload/             # Context bridge
├── src/                     # Renderer process (React)
│   ├── renderer/src/
│   │   ├── components/      # React components
│   │   ├── store/          # Zustand stores
│   │   ├── hooks/          # Custom hooks
│   │   ├── i18n/           # i18n configuration
│   │   ├── locales/        # Translation files
│   │   ├── styles/         # Global styles
│   │   ├── types/          # TypeScript types
│   │   ├── utils/          # Utilities
│   │   ├── App.tsx         # Root component
│   │   └── main.tsx        # Renderer entry
│   └── assets/             # Static assets
├── out/                    # Build output
├── build/                  # Build resources
├── release/                # Packaged releases
└── package.json            # Dependencies and scripts
```

### WebApp
```
/home/alexy/zunosh/webapp/
├── src/
│   ├── components/         # React components
│   ├── hooks/             # Custom hooks
│   ├── pages/             # Page components
│   ├── App.tsx           # Root component
│   ├── main.tsx          # Entry point
│   └── index.css         # Global styles
├── db/
│   ├── migration.sql      # Database schema
│   └── seed.sql          # Test data
├── dist/                 # Build output
├── node_modules/         # Dependencies
└── package.json         # WebApp dependencies
```

## Data Flow

### Desktop App Flow
1. **Authentication**: scrypt password hashing → Supabase auth
2. **Template Management**: CRUD operations for DOCX templates
3. **Document Generation**: Load template → Substitute variables → Generate DOCX
4. **Payment**: Payme/Click integration for premium features
5. **IPC Communication**: Main↔Renderer via context bridge

### WebApp Flow
1. **Authentication**: ID-based login with role detection
2. **Ariza (Leave Requests)**: Parents submit → Teachers approve/reject
3. **Bildirgi (Discipline Records)**: Teachers create with photo evidence
4. **Real-time Chat**: Supabase Realtime pub/sub for messaging
5. **Multi-child**: Parent dashboard for multiple children

## Key Components

### Desktop Components
- **AuthScreen**: Login/register for teachers/directors
- **DocumentEditor**: DOCX preview + variable field editor
- **ShablonBuilder**: Visual template builder (steps, fields, metadata)
- **Search**: Spotlight search (Cmd+K)
- **SettingsPanel**: App configuration
- **PaymentCheckout**: Payment flow UI
- **PricingPage**: Subscription plans
- **CreditBalanceBadge**: Credit display
- **BugReport**: Error reporting

### WebApp Components
- **Auth**: Role-based login (PRT/STCH/TCH/DRK/SCH)
- **Dashboard**: Role-specific views
- **ArizaForm**: Leave request submission
- **BildirgiForm**: Discipline record creation
- **ChatPanel**: Real-time messaging
- **MultiChildSelector**: Child switching for parents
- **Notifications**: Real-time updates

## Database Schema

### Core Tables
- `shablons`: Document templates
- `user_shablons`: User template ownership
- `schools`: School data
- `teachers/doctors`: User data + scrypt passwords
- `classes`: Class assignments
- `payments`: Transaction records

### Key Design Decisions
- Shared React component structure for both apps
- Supabase as unified backend (no separate API servers)
- Monochrome design system (see SKILL.md)
- Role-based access control at UI and database level (RLS)
- Telegram WebApp for zero-install parent access

## Build & Deployment

### Desktop App
```bash
# Development
npm run dev

# Build
npm run build

# Package for Windows
npm run package:win

# Package (uninstaller during development)
npm run package:dir
```

### WebApp
```bash
cd webapp
npm run dev          # localhost:5173
npx vercel --prod    # Deploy to Vercel
```

## Configuration Files
- `opencode.json`: MCP + compaction config
- `electron.vite.config.ts`: Vite for Electron
- `electron-builder.json`: NSIS packaging
- `tsconfig*.json`: TypeScript configs
- `components.json`: shadcn/ui config
- `.env`: Supabase credentials

## Authentication Flow
- Desktop: Supabase auth with scrypt password hashing
- WebApp: ID-based (PRT00001 format) with role suffixes
- Test credentials: TCH00001 / 1234 (teacher role)