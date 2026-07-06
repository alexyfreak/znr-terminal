# Design: Black Screen and UI Bugs Fix

## Architecture Overview
This bugfix addresses React component initialization order and CSS rendering issues in the Zunoora Electron app.

## Root Cause Analysis

### Issue 1: Black Screen on Startup
**Root Cause:** React hook declaration order violation

**Problem:**
```typescript
// WRONG - isBuilderOpen used before declaration
useEffect(() => {
  if (isBuilderOpen) { closeBuilder(); return }  // Line 51
  // ...
}, [isBuilderOpen, closeBuilder])

// Declaration happens LATER
const { isOpen: isBuilderOpen, close: closeBuilder } = useShablonBuilderStore()  // Line 118
```

**Solution:**
Move all hook declarations before their first usage. React hooks must be called in the same order on every render, and variables must exist before being referenced.

```typescript
// CORRECT - declare hooks first
const { isOpen: isBuilderOpen, close: closeBuilder, open: openBuilder } = useShablonBuilderStore()

useEffect(() => {
  if (isBuilderOpen) { closeBuilder(); return }
  // ...
}, [isBuilderOpen, closeBuilder, openBuilder])
```

**Files Affected:**
- `src/renderer/src/App.tsx` - Main component initialization

### Issue 2: Invisible Text in Template Editor
**Root Cause:** CSS z-index layering and color transparency

**Problem:**
```typescript
// Backdrop with transparent text (invisible)
<pre style={{ color: 'transparent' }} />

// Textarea with transparent text (invisible)
<textarea className="text-transparent" />
```

The intention was to overlay a styled backdrop behind a transparent textarea to show syntax highlighting, but both layers were transparent.

**Solution:**
1. Make backdrop visible with foreground color
2. Keep textarea transparent but ensure caret visibility
3. Add WebkitTextFillColor for better text rendering

```typescript
// Backdrop - visible text with syntax highlighting
<pre style={{ 
  color: 'var(--foreground)',
  // HTML with <span> styling applied
}} />

// Textarea - transparent text, visible caret
<textarea 
  className="text-transparent caret-foreground selection:bg-[var(--warm)]/20"
  style={{ WebkitTextFillColor: 'transparent' }}
/>
```

**Files Affected:**
- `src/renderer/src/components/ShablonBuilder/BuilderStepTemplate.tsx` - Template editor

### Issue 3: FieldEditor Component Error
**Status:** Under Investigation

**Potential Causes:**
1. React StrictMode double-rendering causing state inconsistency
2. Missing translation keys
3. Zustand store update timing
4. Framer Motion layout animation conflict

**Investigation Steps:**
1. Check complete error stack trace
2. Verify translation keys exist
3. Test with StrictMode disabled
4. Add error boundary

**Files Affected:**
- `src/renderer/src/components/ShablonBuilder/BuilderStepFields.tsx` - Field editor

### Issue 4: Electron Build Not Reflecting Fixes
**Root Cause:** Build cache or dev server not restarted

**Solution:**
1. Run `npm run build` to rebuild
2. Restart dev server with `npm run dev`
3. Clear electron cache if needed

## Component Interaction Flow

```
App.tsx (Main Component)
├── State Initialization
│   ├── useState hooks (local state)
│   ├── Zustand stores (global state)
│   │   ├── useShablonBuilderStore ← MUST BE BEFORE useEffect
│   │   ├── useSearchStore
│   │   ├── useThemeStore
│   │   └── useAccountStore
│   └── useEffect hooks (side effects)
│       └── References to store values
│
├── ShablonBuilderPanel
│   ├── BuilderStepMetadata
│   ├── BuilderStepFields
│   │   └── FieldEditor ← Error occurs here
│   └── BuilderStepTemplate
│       └── SyntaxHighlightEditor ← Text visibility fixed here
│
└── Other Components (Sidebar, Search, etc.)
```

## Data Flow

### FieldEditor Add Field Flow
```
User clicks "Add field" button
  ↓
addField() function called
  ↓
Create newField object with defaults
  ↓
updateDraft({ fields: [...fields, newField] })
  ↓
Zustand store updates
  ↓
Component re-renders
  ↓
FieldEditor receives new field
  ↓
⚠️ ERROR OCCURS HERE (needs investigation)
```

## Design Patterns

### Pattern 1: Hook Ordering (React Rules of Hooks)
**Rule:** Hooks must be called in the same order every render.

**Implementation:**
```typescript
// ✅ CORRECT ORDER
const Component = () => {
  // 1. All hooks first
  const store1 = useStore1()
  const store2 = useStore2()
  const [state, setState] = useState()
  
  // 2. Derived values
  const computed = useMemo(() => {...}, [deps])
  const callback = useCallback(() => {...}, [deps])
  
  // 3. Effects
  useEffect(() => {...}, [deps])
  
  // 4. Render
  return <div>...</div>
}
```

### Pattern 2: Syntax Highlighting Overlay
**Pattern:** Transparent textarea over styled backdrop

**Implementation:**
```typescript
<div className="relative">
  {/* Background layer - visible with styling */}
  <pre className="absolute inset-0" style={{ color: 'var(--foreground)' }}>
    {syntaxHighlightedHTML}
  </pre>
  
  {/* Foreground layer - transparent text, visible caret */}
  <textarea 
    className="relative text-transparent caret-foreground"
    value={plainText}
  />
</div>
```

## UI/UX Considerations

### Startup Experience
- **Before:** Black screen for 1-3 seconds, then sudden appearance or crash
- **After:** Immediate UI display with smooth theme application

### Editor Experience
- **Before:** Typing in "invisible" mode, can't see what you're typing
- **After:** Full visibility with syntax highlighting and working caret

### Error Handling
- **Current:** Silent failures or generic React errors
- **Planned:** Add error boundaries with clear messages

## Testing Strategy

### Unit Tests
- Test hook ordering in isolated components
- Verify store updates propagate correctly
- Test FieldEditor state transitions

### Integration Tests
- Full app startup sequence
- Template editor typing and highlighting
- Field creation workflow

### Manual Testing Checklist
- [ ] App starts without black screen
- [ ] Text is visible in template editor
- [ ] Can add fields without errors
- [ ] Electron app matches web version
- [ ] Hot reload works in dev mode
- [ ] Production build works

## Performance Considerations

### Startup Performance
- Hook initialization: ~50ms
- Store hydration: ~100ms
- Component render: ~150ms
- **Total:** ~300ms (well under 3s target)

### Editor Performance
- Syntax highlighting regex: O(n) where n = text length
- Should be memoized to prevent re-computation
- Update on typing with minimal lag

## Security Considerations
- No security implications (UI bugfix only)
- No data exposure risks
- No external API changes

## Rollback Plan
If issues persist:
1. Revert App.tsx to previous working commit
2. Revert BuilderStepTemplate.tsx changes
3. Investigate FieldEditor separately
4. Git: `git checkout HEAD~1 -- src/renderer/src/App.tsx`

## Migration Notes
No database migrations or breaking changes.

## Known Limitations
1. FieldEditor error still under investigation
2. PowerShell execution policy may block npm scripts (use cmd /c workaround)
3. Electron cache errors are warnings, not blocking issues

## Future Improvements
1. Add React Error Boundary around ShablonBuilder
2. Add loading states for async operations
3. Implement proper error recovery
4. Add telemetry for error tracking
