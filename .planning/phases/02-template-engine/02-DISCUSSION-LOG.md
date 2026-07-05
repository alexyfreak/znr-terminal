# Phase 2 Discussion Log — Template Engine & Document Types

## Areas Discussed

### 1. Template Count
Discovered 23 shablons in Supabase (not just the original 8 from Zunoora-helps). **Decision**: Include all 23 for maximum MVP value.

### 2. Template Source Strategy
**Decision**: Hybrid — try Supabase first. On success, cache locally. On failure, load from local JSON. Enables offline use after first sync.

### 3. Role-Based Filtering
**Decision**: Role-filtered. Teachers see ~12 teaching-related templates. Directors see all 23.

### 4. Template Engine
**Decision**: Port existing renderer.js to TypeScript as-is. No logic changes — proven.

### 5. Menu Implementation
**Decision**: Port menu.js to TypeScript. Add Supabase → local fallback chain. Add role filter.

## Deferred Ideas
- Admin template management UI (v2)
- Template versioning
- Terminal template preview
