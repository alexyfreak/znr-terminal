# Phase 1 Discussion Log — Foundation & Auth

## Areas Discussed

### 1. Existing Project Review
Reviewed `D:\ZUNOORAA\shablon-filler`:
- Node.js ESM, inquirer, supabase-js, docx
- Login ID auth with role detection (teacher first, then director)
- 3-retry infra error handling
- SERVICE_KEY security guard
- Box-drawing Uzbek CLI
- Auto-fill for 19 field types
- Real .docx tables from `|`-delimited template lines

### 2. Project Structure
**Decision**: Clean up + improve. Convert to TypeScript. Keep module structure.

### 3. Auth Flow
**Decision**: Login ID + PIN (4-6 digits). No session persistence for v1. PIN stored as hash in `teachers`.`pin_hash` and `directors`.`pin_hash`. Keep 3-retry pattern.

### 4. CLI Framework & Styling
**Decision**: Keep `inquirer` v10. Rename header from "Shablon To'ldiruvchi" to "Zunoora". Uzbek throughout. No extra color lib in v1.

### 5. Supabase Config
**Decision**: Copy existing `.env` from the old project. Same Supabase project for now.

### 6. Project Name
**Decision**: `zunoora-cli` (npm name). Display name: "Zunoora".

## Deferred Ideas
- Session persistence (save token, auto-login)
- Password upgrade from PIN to proper Supabase Auth
- CLI colors via chalk/picocolors
