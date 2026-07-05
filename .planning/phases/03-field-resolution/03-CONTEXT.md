# Phase 3: Field Resolution & Interactive Collection — Context

## Domain
Polish field collection: smart field ordering, validation, multi-step wizards for complex documents, and director-specific auto-fill logic.

## Canonical Refs
- `src/index.ts` — current field collection logic (auto-fill + prompts)
- `.planning/REQUIREMENTS.md` — REQ-DOC-09 through REQ-DOC-13
- `D:\ZUNOORAA\shablon-filler\src\collector.js` — existing collector (base)

## Codebase Context
- Auto-fill from Supabase context already works (name, school, director, date, etc.)
- Field prompts are sequential (required first, then optional)
- No validation beyond "not empty"
- No multi-step grouping

## Decisions

### Smart Field Ordering
- Group fields by logical category: Sender info → Recipient info → Document details → Date/signature
- Within each group, required fields come before optional
- Implementation: add `category` metadata to each field in `displayNames` or define field order per shablon type
- For MVP: Hardcode a prioritized field order list rather than per-shablon configuration

### Field Validation
- **Date**: Validate `DD.MM.YYYY` format with Uzbek error "Sana KK.OO.YYYY formatida bo'lishi kerak"
- **Phone**: Validate Uzbek phone format (`+998XXXXXXXXX`) — non-blocking warning
- **Numbers**: Validate numeric fields (hours, percentages, counts) — must be digits
- **Empty**: Keep existing empty-field check

### Multi-Step Wizards (Complex Documents)
- **Buyruq (asosiy/kadr)**, **Tarif-malaka**, **Pedagogik kengash bayoni** — split into logical steps
- Each step has a header like "1-qadam: Ma'lumot" / "2-qadam: Matn" / "3-qadam: Tasdiqlash"
- Steps displayed as grouped sections in the prompt flow (not a separate UI)
- Implementation: Use field prefix matching (e.g., `order_*` fields = step 1, `basis`/`appendix` = step 2)

### Director Document Fields
- When `role === 'director'`, the director IS the sender, so:
  - `sender_name` should auto-fill from `context.user.full_name`
  - `sender_position` auto-fills from `context.user.position` (Direktor)
  - No separate director lookup needed
  - Recipient may be a teacher or external
- Update `autoFillValue` to handle director-as-sender correctly

## Deferred Ideas
- Configurable field ordering per shablon type (v2)
- Rich input types (dropdown for class selection, date picker) (v2)

## Requirements Coverage
- REQ-DOC-09 through REQ-DOC-13: Already implemented in Phase 2, this phase adds polish
