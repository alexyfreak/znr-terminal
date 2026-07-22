# Zunoora — School Document Management Platform

> 🇺🇿 Uzbekistan's digital school workflow platform — connecting parents, teachers, and administrators.

[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE.md)
[![Vercel](https://img.shields.io/badge/deployed-Vercel-000000.svg)](https://zunoora-webapp.vercel.app)
[![Supabase](https://img.shields.io/badge/backend-Supabase-3ECF8E.svg)](https://supabase.com)
[![React](https://img.shields.io/badge/React-19-61DAFB.svg)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5-3178C6.svg)](https://www.typescriptlang.org/)
[![Telegram](https://img.shields.io/badge/bot-Telegram-26A5E1.svg)](https://t.me/zunoorabot)

---

## The Problem

Uzbekistan's schools run on paper. Leave requests, disciplinary records, report cards — every document requires a parent to physically visit the school, wait in line, and fill out forms by hand. Teachers spend hours on paperwork instead of teaching. There is no audit trail, no real-time communication, and no centralized record.

## The Solution

**Zunoora** digitizes the entire parent-teacher administrative workflow through a Telegram WebApp — zero installation, instant access for every parent in Uzbekistan (78%+ Telegram penetration).

### Phase 1 — Live Features

| Feature | Description |
|---|---|
| **ID-based Login** | Unified login for all roles: Parents (PRT00001), Sinf Rahbars (STCH00001), Teachers (TCH00001), Directors (DRK00001), Schools (SCH00001) |
| **Digital Arizalar** | Parents submit leave requests with doctor papers — approved or rejected by teachers in real time |
| **Bildirgi System** | Teachers issue praises & reprimands with photo evidence — instantly visible to parents |
| **Real-time Chat** | Encrypted messaging between parents and teachers via Supabase Realtime |
| **Multi-child Dashboard** | Parents with multiple children switch seamlessly between profiles |
| **Role-based Access** | Each role sees exactly what they need — no more, no less |

### Phase 2 — Upcoming

- Attendance tracking with monthly analytics
- Grade reports and progress cards
- School-wide announcements and notifications
- Director dashboard with school-wide statistics
- Automated PDF report generation
- Multi-language support (Uzbek, Russian, English)

---

## Architecture

```
┌────────────────────────────────────────────┐
│              Telegram (Client)              │
│  ┌──────────────────────────────────────┐  │
│  │         Zunoora WebApp               │  │
│  │  ┌──────┐ ┌──────┐ ┌─────────────┐ │  │
│  │  │ Auth │ │Forms │ │ Real-time   │ │  │
│  │  │(ID+PW)│ │Ariza │ │ Chat       │ │  │
│  │  │      │ │Bildirgi│ │            │ │  │
│  │  └──────┘ └──────┘ └─────────────┘ │  │
│  └──────────────────────────────────────┘  │
└────────────────────────────────────────────┘
                     │
              Vite + React + TS
                     │
         ┌───────────────────────────┐
         │     Supabase              │
         │  ┌─────────┐ ┌────────┐  │
         │  │Postgres │ │Realtime│  │
         │  │+ RLS    │ │Pub/Sub │  │
         │  └─────────┘ └────────┘  │
         └───────────────────────────┘
                     │
         ┌───────────────────────────┐
         │   Telegram Bot (Telegraf) │
         │  Push notifications       │
         └───────────────────────────┘
```

### Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, TypeScript, Tailwind CSS v4 |
| Build | Vite 7 |
| Database | PostgreSQL via Supabase |
| Auth | Custom ID + password (stored function) |
| Real-time | Supabase Realtime (Postgres subscriptions) |
| Notifications | Telegram Bot API (Telegraf) |
| Storage | Supabase Storage (files, images) |
| Hosting | Vercel (production) |
| ID Format | PRT00001, STCH00001, TCH00001, DRK00001, SCH00001 |

---

## Database Schema

### `webapp_users`
Single table for all roles with formatted IDs and passwords.

| Column | Type | Example |
|---|---|---|
| user_id | TEXT (PK) | PRT00001 |
| password | TEXT | parent123 |
| role | TEXT | parent, sinf_rahbar, teacher, director, school, pupil |
| full_name | TEXT | Abdullayev Rustamjon Xalilovich |
| phone | TEXT | +998911234561 |

### `children`
Links pupils to parents and sinf rahbars.

| Column | Type | Example |
|---|---|---|
| pupil_id | TEXT (PK) | PPL000001 |
| full_name | TEXT | Abdullayev Sherzod Rustam o'g'li |
| class_name | TEXT | 9-A |
| parent_id | TEXT (FK) | PRT00001 |
| sinf_rahbar_id | TEXT (FK) | STCH00001 |

### `ariza_requests`, `bildirgi_records`, `chat_messages`
Workflow tables with status tracking, file attachments, and real-time messaging.

---

## Getting Started

### Prerequisites
- Node.js >= 18
- A Supabase project (free tier works)

### Setup

```bash
git clone https://github.com/alexyfreak/zunoora.git
cd zunoora/webapp
cp .env.example .env  # Add your Supabase credentials
npm install
npm run dev           # Local dev at localhost:5173
```

### Database

Run the migration in your Supabase dashboard SQL editor:
1. `webapp/db/migration_v2.sql` — tables, RLS, login function
2. `webapp/db/seed.sql` — test data (5 parents, 5 sinf rahbar, 20 pupils)

---

## Test Accounts

| ID | Password | Role |
|---|---|---|
| PRT00001 | parent123 | Parent (4 children in 9-A) |
| STCH00001 | sinf123 | Sinf Rahbar (9-A class) |
| TCH00001 | tch123 | Teacher |
| DRK00001 | dir123 | Director |
| SCH00001 | school123 | School |
| PPL000001 | pupil123 | Pupil |

---

## Deployment

The webapp is deployed on **Vercel**: [zunoora-webapp.vercel.app](https://zunoora-webapp.vercel.app)

```bash
cd webapp
npx vercel --prod
```

The **Telegram bot** (`@zunoorabot`) serves the WebApp and sends push notifications for ariza approvals and bildirgi updates.

---

## Development

```bash
# WebApp
cd webapp && npm run dev

# Bot
cd bot && node index.js
```

---

## Business Model

Zunoora targets Uzbekistan's **10,000+ schools**, **500,000+ teachers**, and **6M+ parents**. Phase 1 validates product-market fit with the core workflow loop: leave requests + disciplinary records. Expansion phases add paid tier features: analytics, bulk PDF generation, and SMS/Telegram broadcast tools for schools.

---

## Contact

**Zunoora Team** — matritsah4cker@gmail.com  
**WebApp**: [zunoora-webapp.vercel.app](https://zunoora-webapp.vercel.app)  
**Bot**: [@zunoorabot](https://t.me/zunoorabot)  
**GitHub**: [github.com/alexyfreak/zunoora](https://github.com/alexyfreak/zunoora)  

---

*Made with ❤️ for Uzbekistan's education system.*
