# Zunoora — Uzbekistan Teacher Document Assistant

Offline-first desktop application that automates school document workflows for Uzbekistan teachers. A teacher logs in, selects a template, fills in the fields (many auto-filled from their profile), and gets a professionally formatted `.docx` document.

## Tech Stack

- **Runtime:** Node.js (ESM), targeting Electron desktop
- **Language:** TypeScript (strict mode)
- **CLI:** `inquirer` v10 for interactive prompts
- **Database:** Supabase (Postgres) — auth, template storage, teacher/director data
- **Document Generation:** `docx` v8 — generates `.docx` files compatible with Word 2010+
- **Build:** `tsx` for dev execution, `tsc` for production build
- **Auth:** Login ID (8 symbols) + SHA256 PIN hash against `teachers`/`directors` tables

## Project Structure

```
zunoora-cli/
├── src/
│   ├── index.ts          # Entry point — orchestrates the full flow
│   ├── auth.ts           # Login ID + PIN authentication
│   ├── db.ts             # Supabase client, type definitions
│   ├── menu.ts           # Template selection menu
│   ├── templates.ts      # Template loading from Supabase with local cache
│   ├── renderer.ts       # {{placeholder}} template rendering engine
│   ├── docx.ts           # DOCX generation with government-standard formatting
│   └── assets/
│       └── gerb.png      # Uzbekistan state emblem for document headers
├── Blanks/
│   └── shablons.json     # Local cache of downloaded templates
├── output/               # Generated .docx files (gitignored)
├── .env                  # Supabase credentials (gitignored)
└── supabase/migrations/  # Database schema migrations
```

## Setup

```bash
# Install dependencies
npm install

# Configure Supabase credentials
cp .env.example .env
# Edit .env with your SUPABASE_URL and SUPABASE_ANON_KEY

# Run in development
npm start        # or: npm run dev (watch mode)

# Build for production
npm run build
```

## Workflow

The user goes through this flow:

### 1. Authentication

The app prompts for a **Login ID** (8 symbols) and **PIN** (4-6 digits). It queries the `teachers` table first, then falls back to `directors`. PINs are SHA256-hashed before querying — the app uses Supabase anon key only (never service key) and validates at startup.

On success, the app loads:
- **School** info (name, address, phone)
- **Director** details (for auto-filling recipient fields)
- **Classes** (teacher's form classes or all school classes for directors)
- **Role** (`teacher` or `director`) — determines which templates are visible

### 2. Template Selection

A numbered menu shows all available templates filtered by role:
- **Teachers** see only templates with `teacher_visible = true`
- **Directors** see all templates

Each template (`shablon`) has:
- `type` — unique identifier (e.g., `ariza`, `ish_tabeli`)
- `label` — Uzbek display name
- `description` — brief explanation
- `schema` — JSON with `required` and `optional` field arrays
- `template` — body text with `{{placeholder}}` syntax
- `keywords` — search tags

Templates are fetched from Supabase `shablons` table and cached locally in `Blanks/shablons.json`.

### 3. Field Collection

For each field in the template's schema, the app:
1. **Auto-fills** known values from the user's context (name, school, director, date, academic year)
2. **Required fields** are prompted with validation (date format, numeric checks, non-empty)
3. **Optional fields** ask for confirmation first: "Qo'shilsinmi?" (Include?)
4. **Complex documents** (buyruq, tarif_malaka, pedagogik_kengash_bayoni, etc.) use multi-step wizards with grouped fields

#### Auto-fill Mapping

| Field | Source |
|-------|--------|
| `school` | `context.school.name` |
| `director_name`, `recipient_name` | `context.director.full_name` |
| `sender_name`, `teacher_name`, `employee_name` | `context.user.full_name` |
| `sender_position`, `position` | `context.user.position` |
| `subject` | `context.user.subject` (teachers only) |
| `class_name`, `academic_year` | `context.classes[0]` |
| `date` | Current date (DD.MM.YYYY) |
| `school_phone`, `school_address` | `context.school` |

#### Supported Document Types (8)

| Type | Uzbek Name | Description |
|------|-----------|-------------|
| `ariza` | Ariza | Formal application |
| `ish_tabeli` | Ish Tabeli | Work schedule |
| `ktp` | KTP | Calendar-thematic plan |
| `oum` | O'UM | Educational-methodological complex |
| `bsb` | BSB/CHB | Summative assessment |
| `sillabus` | Sillabus | Syllabus |
| `hisobot` | Hisobot | Report |
| `tushuntirish_xati` | Tushuntirish Xati | Explanatory letter |

Plus extended types: buyruq_asosiy, buyruq_kadr, tarif_malaka, pedagogik_kengash_bayoni, shaxsiy_delo, dalolatnoma, and more.

### 4. Preview & Confirmation

The filled template is rendered (substituting `{{placeholder}}` values) and displayed in the terminal. The user can confirm or cancel generation.

### 5. DOCX Generation

Using the `docx` library, the app generates a Word document with government-standard formatting:

- **Font:** Times New Roman 14pt (body), 12pt (sender line)
- **Line spacing:** 1.5
- **Margins:** left 20mm, top 10mm, right 8mm, bottom 8mm
- **Header:** Uzbekistan state emblem (gerb) centered → ministry name → school name
- **Formatting heuristics:**
  - All-caps lines → centered, bold (headings)
  - Lines with `__________` or starting with "Imzo"/"Direktor" → right-aligned (signatures)
  - Lines with ` || ` delimiter → split layout (left text, right tab-stop)
  - Everything else → justified

Files are saved to `output/` with naming pattern: `{type}_{teacher_name}_{DDMMYYYY}.docx`

## Supabase Schema

The app expects these tables:

### `teachers`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `full_name` | text | Teacher's full name |
| `login_id` | text | 8-symbol login identifier |
| `pin_hash` | text | SHA256 hash of PIN |
| `position` | text | e.g., "O'qituvchi" |
| `subject` | text | Subject taught |
| `school_id` | uuid | FK to schools |
| `phone` | text | Optional |

### `directors`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `full_name` | text | Director's full name |
| `login_id` | text | 8-symbol login identifier |
| `pin_hash` | text | SHA256 hash of PIN |
| `school_id` | uuid | FK to schools |
| `position` | text | e.g., "Direktor" |

### `schools`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | School name |
| `address` | text | Optional |
| `phone` | text | Optional |

### `shablons`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `type` | text | Unique type key |
| `label` | text | Uzbek display name |
| `description` | text | Brief explanation |
| `keywords` | text[] | Search tags |
| `teacher_visible` | bool | Whether teachers can see it |
| `schema` | jsonb | `{required: string[], optional: string[]}` |
| `template` | text | Body with `{{placeholder}}` syntax |

### `classes`
| Column | Type | Notes |
|--------|------|-------|
| `id` | uuid | Primary key |
| `name` | text | Class name |
| `school_id` | uuid | FK to schools |
| `form_teacher_id` | uuid | FK to teachers |
| `academic_year` | text | e.g., "2025-2026" |

## Security

- **No service key** — the app validates at startup that `SUPABASE_SERVICE_KEY` is not set; only anon key is used
- **Row Level Security** — all data access goes through Supabase RLS policies
- **No .env in git** — credentials stay local
- **PIN hashing** — PINs are SHA256-hashed client-side before querying; Supabase tables store `pin_hash`, never plaintext

## Commands

```bash
npm start        # Run the app (tsx)
npm run dev      # Run with file watch
npm run build    # Compile TypeScript
npm test         # Run tests
```
