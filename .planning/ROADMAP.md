# Zunoora — Roadmap

## Milestone: v1.0 CLI MVP

### Phase 1: Project Foundation & Auth
**Goal:** Working CLI scaffold with Supabase authentication (teacher/director login) and role detection.
**Success Criteria:**
- `npm start` launches CLI with color-coded welcome screen
- Teacher can log in with 8-symbol login ID → sees teacher templates
- Director can log in → sees director templates
- Invalid login shows clear error in Uzbek
**Requirements:** REQ-AUTH-01, REQ-AUTH-02, REQ-AUTH-03, REQ-CLI-01, REQ-CLI-02, REQ-CLI-03
**Mode:** Standard

### Phase 2: Template Engine & Document Types
**Goal:** Fetch templates from Supabase, implement placeholder engine, define all 8 shablons.
**Success Criteria:**
- Templates loaded from Supabase `shablons` table
- `{{placeholder}}` substitution works correctly
- All 8 document templates defined in Supabase with schemas
- Template selection menu shows correct list based on role
**Requirements:** REQ-TMPL-01, REQ-TMPL-02, REQ-TMPL-03, REQ-DOC-01 through REQ-DOC-08
**Mode:** Standard

### Phase 3: Field Resolution & Interactive Collection
**Goal:** Auto-fill known fields, prompt for missing fields in Uzbek conversational flow.
**Success Criteria:**
- Teacher name, position, subject, school auto-filled from profile
- Director name auto-filled from directors table
- Date and academic year auto-calculated
- Required fields prompted in Uzbek one at a time
- Optional fields prompted with clear labels
**Requirements:** REQ-DOC-09, REQ-DOC-10, REQ-DOC-11, REQ-DOC-12, REQ-DOC-13
**Mode:** Standard

### Phase 4: Document Export & Polish
**Goal:** Generate professional `.docx` files, save to organized output directory, polish CLI experience.
**Success Criteria:**
- Generated `.docx` opens correctly in Word 2010+
- Times New Roman, proper margins, centered headings, right-aligned signatures
- Files saved to `output/` with descriptive filenames
- Full end-to-end flow works: login → select → fill → preview → generate
**Requirements:** REQ-DOC-14, REQ-DOC-15, REQ-DOC-16
**Mode:** Standard

## Milestone: v2.0 Electron Desktop

### Phase 5: Electron Shell & GUI
**Goal:** Migrate CLI to Electron desktop app with graphical interface.
### Phase 6: Conversational Q&A & AI Enhancement
**Goal:** Natural conversation flow for field collection + optional AI enhancement.
### Phase 7: Offline Mode & Sync
**Goal:** Offline-first with cached templates and background Supabase sync.
### Phase 8: Template Management UI
**Goal:** Add/edit/delete templates from within the app UI.
