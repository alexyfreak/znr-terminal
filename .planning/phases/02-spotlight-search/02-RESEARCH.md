# Phase 2: Spotlight Search & Transitions — Research

## Key Implementation Details

### Search Bar Behavior (from promptt.md §4.2-4.3)
- Single cohesive visual element: bar + results share border radius, shadow, seamless join
- Debounce ~150-200ms on typing
- "+ New shablon" pinned above all results when visible
- Empty query + focused: show recent suggestions
- Clicking result → smooth animation from center to top-left
- Content area cross-fade/slide to reveal Document Fulfillment View placeholder

### Design Spec (8.3 ChatPanel — Center Mode)
- max-width: 672px (max-w-2xl)
- Input panel: rounded-2xl, hairline border, surface at 80% opacity, backdrop blur
- Shadow: 0 8px 30px -12px rgba(0,0,0,0.6)
- Search bar center mode has spring animation stiffness 180, damping 26

### Design Spec (8.4 ChatPanel — Corner Mode)
- Position: fixed, bottom: 24px, right: 24px, z-30
- Dimensions: 380px × 460px
- Background: #0A0A0A at 95% opacity
- Border: hairline, rounded-2xl
- Shadow: 0 30px 80px -20px rgba(0,0,0,0.9)
- Backdrop: backdrop-blur-xl

### Search Results Design
- Results panel extends below search bar as one unified element
- Shared rounded-2xl bottom radius
- Each result item: hover state bg-surface-hover (#1A1A1A)
- "+ New shablon" row: plus icon + label, special styling (bottom divider?)

### Build Pipeline
- Already have electron-builder.json with NSIS config
- Need to verify build && dist works

## Component Design

### SpotlightSearchBar
- States: idle (centered, small), focused (expanded with results), docked (top-left post-selection)
- Uses Framer Motion AnimatePresence for enter/exit transitions
- Uses useSearchStore for query/focus/docked state
- Input styled as textarea-like div with contentEditable or just input

### SearchResultsList
- Uses useSearchStore results
- AnimatePresence for list items
- Shows NewShablonAction as first item
- Empty state shows recent suggestions

### NewShablonAction
- Simple row: plus icon + "New shablon" label
- On click → triggers same transition as selecting a result

## Transition Flow
1. User clicks result or "+ New shablon"
2. setDocked(true) on search store
3. Search bar animates from center to top-left corner
4. Content area cross-fades to DocumentFulfillmentView placeholder
5. DocumentFulfillmentView appears with spring animation

## Files to Create/Modify
- src/renderer/src/components/Search/SpotlightSearchBar.tsx
- src/renderer/src/components/Search/SearchResultsList.tsx
- src/renderer/src/components/Search/NewShablonAction.tsx
- src/renderer/src/components/Search/index.ts
- src/renderer/src/components/DocumentFulfillmentCard/DocumentFulfillmentCard.tsx (placeholder)
- src/renderer/src/components/DocumentFulfillmentCard/index.ts
- src/renderer/src/App.tsx (update to include search + transitions)
- src/renderer/src/styles/globals.css (potential additions)
- electron-builder.json (verify/adjust)
