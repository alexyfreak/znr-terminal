---
phase: code-review
reviewed: 2026-07-06T12:00:00Z
depth: deep
files_reviewed: 17
files_reviewed_list:
  - electron\main\db.ts
  - electron\main\templates.ts
  - electron\main\ipc-handlers.ts
  - electron\preload\index.ts
  - src\renderer\src\types\electron.d.ts
  - src\renderer\src\store\useShablonBuilderStore.ts
  - src\renderer\src\components\ShablonBuilder\ShablonBuilderPanel.tsx
  - src\renderer\src\components\ShablonBuilder\ShablonBuilder.tsx
  - src\renderer\src\components\ShablonBuilder\BuilderStepTemplate.tsx
  - src\renderer\src\components\ShablonBuilder\BuilderStepMetadata.tsx
  - src\renderer\src\components\ShablonBuilder\BuilderStepFields.tsx
  - src\renderer\src\components\ShablonBuilder\ShablonLibrary.tsx
  - src\renderer\src\components\ShablonBuilder\ShablonMarketplace.tsx
  - src\renderer\src\App.tsx
  - src\renderer\src\components\Search\NewShablonAction.tsx
  - src\renderer\src\components\FieldCollector\FieldCollector.tsx
  - src\renderer\src\components\DocumentFulfillmentCard\DocumentFulfillmentCard.tsx
findings:
  critical: 2
  warning: 7
  info: 6
  total: 15
status: issues_found
---

# Code Review Report

## Summary

Reviewed 17 files across the Electron main process, preload, renderer types, Zustand store, and React components for the Shablon Builder feature. Found **2 critical runtime errors**, **3 high-severity logic/data bugs**, **4 medium-severity issues**, and **6 low-severity quality defects**.

**Key concerns:**
1. `SyntaxHighlightEditor` component will crash at runtime — `t()` translation function used without being in scope
2. `updateShablon` version increment logic is broken — always sets `version: undefined`
3. Autocomplete popup positioning uses `fixed` with coordinates relative to textarea content, not viewport — guaranteed misalignment when scrolled
4. `autoFill` property on `ShablonFieldData` is completely ignored in `FieldCollector`
5. No diff/update mode — "Edit" in library always creates a new shablon instead of updating

---

## Critical Issues

### CR-01: SyntaxHighlightEditor crashes at runtime — `t` is not defined

**File:** `src\renderer\src\components\ShablonBuilder\BuilderStepTemplate.tsx:443,468`
**Severity:** CRITICAL — runtime ReferenceError

**Issue:**
The `SyntaxHighlightEditor` function component (defined at line 255, outside `BuilderStepTemplate`) calls `t()` at lines 443 and 468, but `t` is never imported or passed into the component. `const { t } = useTranslation()` is only called inside `BuilderStepTemplate` (line 8) and is NOT in scope for `SyntaxHighlightEditor`.

When this component renders:
- Line 443: `placeholder={t('shablonBuilder.templatePlaceholder')}` — throws `ReferenceError: t is not defined`
- Line 468: `{t('shablonBuilder.suggestions')}` — throws `ReferenceError: t is not defined`

**Fix:**
Add `useTranslation` call inside `SyntaxHighlightEditor`:
```tsx
function SyntaxHighlightEditor({...}: Props) {
  const { t } = useTranslation()
  // ... rest of component
}
```

---

### CR-02: updateShablon version increment is always undefined

**File:** `electron\main\templates.ts:80`
**Severity:** CRITICAL — data integrity bug

**Issue:**
```typescript
version: supabase.rpc('increment_version', { row_id: id }).then ? undefined : (updates.version || 1),
```

`supabase.rpc()` returns a `PostgrestFilter` (a thenable object). Since it has a `.then()` method, the ternary ALWAYS evaluates as `true → undefined`. The RPC is never awaited or executed — no version column ever gets incremented.

This means every call to `updateShablon` sets `version: undefined` in the database, effectively always resetting or nullifying the version column.

**Fix:**
Remove the pseudo-RPC call and handle versioning properly:
```typescript
export async function updateShablon(id: string, updates: Partial<Shablon>): Promise<Shablon | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('shablons')
    .update({
      ...updates,
      updated_at: new Date().toISOString(),
      version: supabase.rpc('increment_version', { row_id: id }),
    })
    .eq('id', id)
    .select()
    .single()
  // ...
```
Or if version increment should be handled by the DB via trigger, remove this line entirely and ensure a DB trigger handles it. If not, simply pass undefined or let the DB default handle it:
```typescript
version: (updates.version ?? 0) + 1,
```

---

## High Severity Issues

### HI-01: Autocomplete popup positioning uses `fixed` with wrong coordinate space

**File:** `src\renderer\src\components\ShablonBuilder\BuilderStepTemplate.tsx:461-464`
**Severity:** HIGH — UI bug, guaranteed misalignment

**Issue:**
The autocomplete popup uses `className="fixed"` (line 461) with coordinates computed from `getCaretCoordinates()` (lines 301-318). The caret coordinates are computed relative to the textarea element's content (padding + lineHeight * row + charWidth * col), NOT relative to the viewport. The `fixed` positioning means `top` and `left` are relative to the viewport.

If the textarea is scrolled, the modal is scrolled, or the page has any scroll offset, the popup will appear at the wrong position. The arbitrary offsets `+100` and `+40` (lines 463-464) are brittle and don't account for:
- Scroll position of the textarea's overflow container
- Different font sizes or line heights
- Zoom levels

**Fix:**
Compute viewport-relative coordinates using `getBoundingClientRect()`:
```tsx
const getCaretCoordinates = (): { top: number; left: number } => {
  const textarea = textareaRef.current
  if (!textarea) return { top: 0, left: 0 }
  const pos = textarea.selectionStart
  const text = value.substring(0, pos)
  const lines = text.split('\n')
  const lineNumber = lines.length - 1
  const colNumber = lines[lines.length - 1].length
  
  // Create a proxy element to measure position
  const mirror = document.createElement('div')
  const style = window.getComputedStyle(textarea)
  mirror.style.cssText = `
    position: fixed; top: -9999px; left: -9999px;
    white-space: pre-wrap; word-wrap: break-word;
    font-family: ${style.fontFamily};
    font-size: ${style.fontSize};
    line-height: ${style.lineHeight};
    padding: ${style.padding};
    width: ${textarea.clientWidth}px;
  `
  mirror.textContent = text.substring(0, pos)
  document.body.appendChild(mirror)
  
  const span = document.createElement('span')
  span.textContent = '\u200B'  // zero-width space for cursor position
  mirror.appendChild(span)
  
  const rect = span.getBoundingClientRect()
  document.body.removeChild(mirror)
  
  return { top: rect.top, left: rect.left }
}
```

Or use `position: absolute` instead of `fixed` and ensure the parent container is positioned:
```tsx
// Change the className from "fixed" to "absolute" and wrap in relative container
className="absolute z-50 w-64 rounded-xl ..."
```

---

### HI-02: autoFill property on ShablonFieldData is completely ignored in FieldCollector

**File:** `src\renderer\src\components\FieldCollector\FieldCollector.tsx:475`
**Severity:** HIGH — data loss / unexpected behavior

**Issue:**
`FieldCollector.renderField` computes auto-fill value using only the hardcoded `getAutoFill(field)` function (line 475):
```typescript
const auto = getAutoFill(field)
const defaultValue = auto || fieldDef?.defaultValue || ''
```

The `fieldDef?.autoFill` property (part of `ShablonFieldData` interface, line 352) is never consulted. If a shablon defines a field with `autoFill: 'userName'` or `autoFill: 'schoolName'`, that auto-fill directive is completely ignored because `getAutoFill` only handles specific hardcoded keys (`teacher_name`, `employee_name`, `sender_name`, etc.).

This means custom shablons with `autoFill` annotations on their fields will not get automatic values filled in, breaking the expected user experience.

**Fix:**
Expand the auto-fill resolution to respect `fieldDef.autoFill`:
```typescript
const resolveAutoFill = (autoFill: string): string | null => {
  const map: Record<string, string | null | undefined> = {
    userName: userName || null,
    schoolName: schoolName || null,
    directorName: userContext?.directorName || null,
  }
  return map[autoFill] ?? null
}

const getAutoFill = useCallback((field: string): string | null => {
  const map: Record<string, string | null | undefined> = {
    teacher_name: userName || null,
    employee_name: userName || null,
    // ... existing mappings
  }
  return map[field] ?? null
}, [userName, schoolName, userContext])

// In renderField:
const auto = getAutoFill(field) || (fieldDef?.autoFill ? resolveAutoFill(fieldDef.autoFill) : '')
```

---

### HI-03: Steps can be `undefined` — type inconsistency and potential empty array crash

**File:** `src\renderer\src\components\FieldCollector\FieldCollector.tsx:388`
**Severity:** HIGH — potential runtime crash

**Issue:**
At line 388:
```typescript
const steps = propSteps || (shablonType ? complexSteps[shablonType] : null)
```
If `shablonType` is a string that isn't a key in `complexSteps`, `complexSteps[shablonType]` returns `undefined`. Since `null || undefined` evaluates to `undefined`, `steps` becomes `undefined`.

At line 398:
```typescript
const currentHeader = steps && currentStep < steps.length ? steps[currentStep].header : null
```
The short-circuit evaluation (`steps &&`) prevents accessing `.length` on `undefined`. TypeScript infers `currentHeader` as `string | false | null` (not `string | null`), which can cause downstream type mismatches if passed to components expecting `string | null`.

At line 431:
```typescript
const fieldsToCheck = steps ? steps[currentStep].fields : schema.required
```
If `steps` is an empty array `[]` (truthy), `steps[0]` is `undefined`, and `steps[0].fields` throws `TypeError: Cannot read properties of undefined`. While the current code doesn't produce empty arrays, future changes to `complexSteps` could introduce one without warning.

**Fix:**
```typescript
const steps = propSteps ?? (shablonType ? (complexSteps[shablonType] ?? null) : null)

// Or with length guard:
const steps = propSteps?.length
  ? propSteps
  : (shablonType ? complexSteps[shablonType] : null) || null
```

---

## Medium Severity Issues

### ME-01: "Edit" always creates new shablon instead of updating existing

**File:** `src\renderer\src\components\ShablonBuilder\ShablonLibrary.tsx:99` / `useShablonBuilderStore.ts:184`
**Severity:** MEDIUM — data integrity bug

**Issue:**
When a user clicks "Edit" on an installed shablon (ShablonLibrary.tsx line 98-100):
```typescript
const handleEdit = () => {
  updateDraft(shablon)
  setTab('builder')
}
```
This loads the entire shablon object (including `id`, `created_at`, `updated_at`) into the draft. But when the user clicks "Create" in the builder (ShablonBuilder.tsx line 33-37):
```typescript
const handleSave = async () => {
  const result = await createShablon()
```
The store's `createShablon` always calls `window.electronAPI.createShablon(draft)` which invokes the `shablon:create` IPC handler, which does an INSERT — always creating a new record. The original shablon's ID is ignored.

This means editing an existing shablon and saving always creates a duplicate. The original shablon is never updated unless the user separately deletes it.

**Fix:**
Add a `draftId` field to the store to distinguish create vs. update mode:
```typescript
// In store
draftId: string | null,  // null = new, non-null = update existing

// When editing:
handleEdit = (shablon) => {
  set({ draft: shablon, draftId: shablon.id, wizardStep: 0 })
  setTab('builder')
}

// handleSave / createShablon:
if (draftId) {
  await window.electronAPI?.updateShablon(draftId, draft)
} else {
  await window.electronAPI?.createShablon(draft)
}
```

---

### ME-02: View state not reset when historyItem changes in DocumentFulfillmentCard

**File:** `src\renderer\src\components\DocumentFulfillmentCard\DocumentFulfillmentCard.tsx:41`
**Severity:** MEDIUM — incorrect UI state

**Issue:**
The `view` state is initialized once from `historyItem?.exportPath`:
```typescript
const [view, setView] = useState<View>(historyItem?.exportPath ? 'done' : 'fields')
```
If the user selects a different history item while the card is mounted, the `view` state is NOT updated because `useState` ignores prop changes after the first render. If the previous item had an exportPath but the new one doesn't, the card will incorrectly show the "done" view for a fresh/incomplete item.

Similarly, `fieldValues` and `exportPath` states (lines 42-43) are initialized from `historyItem` but never re-synced when `historyItem` changes.

**Fix:**
Use `useEffect` to sync state when `historyItem` identity changes:
```typescript
const [view, setView] = useState<View>('fields')
const [fieldValues, setFieldValues] = useState<Record<string, string> | null>(null)
const [exportPath, setExportPath] = useState<string | null>(null)

useEffect(() => {
  if (historyItem?.exportPath) {
    setView('done')
    setExportPath(historyItem.exportPath)
    setFieldValues(historyItem.fieldValues || null)
  } else {
    setView('fields')
    setExportPath(null)
    setFieldValues(null)
  }
}, [historyItem?.id])  // reset when specific history item changes
```

---

### ME-03: Step indicator allows jumping to incomplete steps

**File:** `src\renderer\src\components\ShablonBuilder\ShablonBuilder.tsx:50`
**Severity:** MEDIUM — logic / UX bug

**Issue:**
The step indicator buttons (lines 47-67) call `setWizardStep(i)` directly with no validation:
```tsx
<button
  onClick={() => setWizardStep(i as 0 | 1 | 2 | 3)}
```
A user on step 0 can click on step 2 in the indicator and jump directly to the template editor without filling in metadata or fields. While the UI renders correctly, auto-save triggers, and the draft may be incomplete. This bypasses the `canProceed()` guard that's only checked in `handleNext`.

**Fix:**
Disable forward-jumping or validate on step change:
```tsx
<button
  onClick={() => {
    if (i <= wizardStep || canProceed()) {
      setWizardStep(i as 0 | 1 | 2 | 3)
    }
  }}
  disabled={i > wizardStep}
  className={`... ${i > wizardStep ? 'cursor-not-allowed opacity-50' : ''}`}
>
```

---

### ME-04: Event handler stale closure — handleSelect not in dependency array

**File:** `src\renderer\src\App.tsx:110-120`
**Severity:** MEDIUM — potential stale handler bug

**Issue:**
The `shablon:select` event listener effect depends on `[templates]` but uses `handleSelect` which is not in the dependency array:
```typescript
useEffect(() => {
  const handler = (e: CustomEvent) => { ... handleSelect(type) ... }
  window.addEventListener('shablon:select', handler as EventListener)
  return () => window.removeEventListener('shablon:select', handler as EventListener)
}, [templates])  // handleSelect is missing!
```

`handleSelect` is wrapped in `useCallback` (line 122) and depends on `setDocked, setActiveId` (stable zustand references). While this works in practice, it violates React Rules of Hooks and could cause issues if those dependencies change. The closure captures `handleSelect` from the first render; if it ever changes, the effect would still use the stale version.

**Fix:**
Include `handleSelect` in the dependency array:
```typescript
useEffect(() => {
  const handler = (e: CustomEvent) => {
    const type = e.detail
    const tmpl = templates.find(t => t.type === type)
    if (tmpl) handleSelect(type)
  }
  window.addEventListener('shablon:select', handler as EventListener)
  return () => window.removeEventListener('shablon:select', handler as EventListener)
}, [templates, handleSelect])
```

---

## Low Severity Issues

### LO-01: No backdrop click handler to close builder panel

**File:** `src\renderer\src\components\ShablonBuilder\ShablonBuilderPanel.tsx:37-101`
**Severity:** LOW — UX inconsistency

**Issue:**
The backdrop overlay (line 43) has no `onClick` handler. Users closing modal-like panels (SettingsPanel, AccountMenu) via Escape or backdrop click expect the same behavior from the builder panel. Currently the only way to close is the X button.

This is the outermost `motion.div` with `className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm"`.

**Fix:**
Add click handler on the backdrop that delegates to `onClose`:
```tsx
<motion.div
  onClick={(e) => {
    if (e.target === e.currentTarget) onClose()
  }}
  // ... rest of props
>
```

---

### LO-02: Autosave on every draft change with no debounce

**File:** `src\renderer\src\components\ShablonBuilder\ShablonBuilder.tsx:16-18`
**Severity:** LOW — performance

**Issue:**
```typescript
useEffect(() => {
  saveDraft()
}, [draft, saveDraft])
```
This fires on EVERY draft change — every keystroke in label/description inputs and every keystroke in the template editor. The `saveDraft` function writes to a JSON file via IPC, which is a synchronous-ish filesystem operation in the main process.

While the JSON store write is fast, this creates unnecessary IPC traffic and could cause typing lag on slower machines.

**Fix:**
Add a debounce:
```typescript
useEffect(() => {
  const timer = setTimeout(() => saveDraft(), 500)
  return () => clearTimeout(timer)
}, [draft, saveDraft])
```

---

### LO-03: Dual state for marketplace data (marketplace vs marketplaceResults) is confusing

**File:** `src\renderer\src\store\useShablonBuilderStore.ts:57,59`
**Severity:** LOW — maintainability

**Issue:**
The store has both `marketplace` (full cached list) and `marketplaceResults` (search-filtered list). The `fetchMarketplace` action sets both, while `searchMarketplace` only sets `marketplaceResults`. Components use `marketplaceResults` for display, making `marketplace` a dead cache.

When `searchMarketplace("")` is called (empty query), it calls `get().fetchMarketplace()` which refetches everything and sets both. This is redundant since `marketplace` already has the full list.

**Fix:**
Eliminate the dual state — use a single `marketplace` array and derive the filtered view in the component or use a query-dependent state:
```typescript
// Option 1: Single source with local filtering
marketplace: Shablon[]

// Option 2: Cache + derived
marketplaceCache: Shablon[]  // full list from DB
marketplaceResults: Shablon[]  // filtered/search results
```

---

### LO-04: Autocomplete hidden when more than 15 field keys match

**File:** `src\renderer\src\components\ShablonBuilder\BuilderStepTemplate.tsx:357`
**Severity:** LOW — UX limitation

**Issue:**
```typescript
if (matches.length > 0 && matches.length < 15) {
```
When the user types `{{` with no filter text, `token` is `''`, which matches ALL field keys. If there are 15+ fields, the autocomplete popup doesn't appear at all — even to show "no matches" state. The user gets no visual feedback and no way to see available variables via autocomplete.

**Fix:**
Always show autocomplete for empty token (showing all fields) or when count is large, cap at a reasonable limit:
```typescript
if (matches.length > 0) {
  const displayMatches = matches.slice(0, 20)  // limit for rendering
  // ... show matches with scroll
  if (matches.length > 20) {
    // Append "Show all XX results" or scroll container
  }
}
```

---

### LO-05: Non-animated style changes during full-screen transition

**File:** `src\renderer\src\components\ShablonBuilder\ShablonBuilderPanel.tsx:44,93`
**Severity:** LOW — visual jank

**Issue:**
When transitioning to full-screen template editing mode (`isTemplateStep === true`), two style properties change immediately without animation:
- Line 44: `style={{ padding: isTemplateStep ? 0 : undefined }}` on the backdrop
- Line 93: `style={{ padding: isTemplateStep ? 0 : '1.25rem' }}` on the content area

These are inline `style` props, not part of framer-motion's `animate`. While the modal size/position values (lines 52-57) are animatable via `animate`, the padding changes instantly, causing a slight visual jump during transition.

**Fix:**
Move padding to the framer-motion `animate` prop:
```tsx
<motion.div
  animate={{
    padding: isTemplateStep ? 0 : undefined,
    // ... other values
  }}
>
```

---

### LO-06: FieldCollector `initialValues` computed with stale `getAutoFill`

**File:** `src\renderer\src\components\FieldCollector\FieldCollector.tsx:374-381`
**Severity:** LOW — stale data on re-render

**Issue:**
`initialValues` is computed via `useMemo` with deps `[allFields, getAutoFill]`. However, `allFields` is derived from `propFields` (line 370-372) and `schema` (when `propFields` is not provided). If `propFields` or `schema` change after the initial render, `allFields` changes but `values` state (line 383) is NOT re-initialized — it only captures the `initialValues` at first mount via `useState(initialValues)`.

This means if a user opens a different shablon type with different fields, the old values persist.

**Fix:**
Track the shablon identity and reset values when it changes:
```typescript
const [values, setValues] = useState<Record<string, string>>({})
const [errors, setErrors] = useState<Record<string, string>>({})

// Reset when shablon identity changes
useEffect(() => {
  setValues(initialValues)
  setErrors({})
  setCurrentStep(0)
}, [shablonType, JSON.stringify(allFields)])
```

---

## Structural Findings (fallow)

No structural pre-pass was provided for this review.

---

## Files Reviewed

| # | File | Lines | Issues Found |
|---|------|-------|-------------|
| 1 | `electron\main\db.ts` | 95 | 0 |
| 2 | `electron\main\templates.ts` | 154 | 1 (CR-02) |
| 3 | `electron\main\ipc-handlers.ts` | 246 | 0 |
| 4 | `electron\preload\index.ts` | 66 | 0 |
| 5 | `src\renderer\src\types\electron.d.ts` | 34 | 0 |
| 6 | `src\renderer\src\store\useShablonBuilderStore.ts` | 246 | 1 (LO-03) |
| 7 | `src\renderer\src\components\ShablonBuilder\ShablonBuilderPanel.tsx` | 104 | 2 (LO-01, LO-05) |
| 8 | `src\renderer\src\components\ShablonBuilder\ShablonBuilder.tsx` | 152 | 2 (ME-03, LO-02) |
| 9 | `src\renderer\src\components\ShablonBuilder\BuilderStepTemplate.tsx` | 587 | 3 (CR-01, HI-01, LO-04) |
| 10 | `src\renderer\src\components\ShablonBuilder\BuilderStepMetadata.tsx` | 165 | 0 |
| 11 | `src\renderer\src\components\ShablonBuilder\BuilderStepFields.tsx` | 334 | 0 |
| 12 | `src\renderer\src\components\ShablonBuilder\ShablonLibrary.tsx` | 177 | 1 (ME-01) |
| 13 | `src\renderer\src\components\ShablonBuilder\ShablonMarketplace.tsx` | 152 | 0 |
| 14 | `src\renderer\src\App.tsx` | 211 | 1 (ME-04) |
| 15 | `src\renderer\src\components\Search\NewShablonAction.tsx` | 34 | 0 |
| 16 | `src\renderer\src\components\FieldCollector\FieldCollector.tsx` | 643 | 3 (HI-02, HI-03, LO-06) |
| 17 | `src\renderer\src\components\DocumentFulfillmentCard\DocumentFulfillmentCard.tsx` | 272 | 1 (ME-02) |

---

## Issues Summary

| Severity | Count | IDs |
|----------|-------|-----|
| CRITICAL | 2 | CR-01, CR-02 |
| HIGH | 3 | HI-01, HI-02, HI-03 |
| MEDIUM | 4 | ME-01, ME-02, ME-03, ME-04 |
| LOW | 6 | LO-01, LO-02, LO-03, LO-04, LO-05, LO-06 |
| **Total** | **15** | |

---

_Reviewed: 2026-07-06T12:00:00Z_
_Reviewer: gsd-code-reviewer (deep analysis)_
_Depth: deep_
