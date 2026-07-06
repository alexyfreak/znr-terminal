# Known Bugs & UX Issues

## 1. Search bar focus animation is jumpy
- **File:** `src/renderer/src/components/Search/SpotlightSearchBar.tsx`
- **Issue:** When clicking the search bar, the border-radius change (`rounded-2xl` → `rounded-t-2xl rounded-b-none`) and border color change happen instantly via CSS class swap. Framer Motion's `layout` prop doesn't interpolate border-radius, so the transition looks abrupt.
- **Fix idea:** Animate the search bar height/position instead of border-radius, or use a separate overlay element for the results panel that slides out from under the bar.

## 2. Zunoora brand text + search bar not properly centered
- **File:** `src/renderer/src/App.tsx`
- **Issue:** The "Zunoora" brand text (in MainStage) and the search bar should be perfectly centered as a unified composition (brand above, search below). Currently they're in separate layers (absolute vs absolute) and may not align properly.
- **Fix idea:** Group brand text and search bar in a single centered container so they compose naturally as a vertical stack.

## 3. Docked search bar overlaps fulfillment card
- **File:** `src/renderer/src/App.tsx`
- **Issue:** When a result is selected, the search bar docks to the top-left corner (fixed position) and the DocumentFulfillmentCard appears below. The search bar and card can overlap visually if padding is off.
- **Fix idea:** Ensure the fulfillment card container has sufficient top padding (`pt-16` or more) and the z-index layering is correct so the fixed search bar doesn't clip into the card.

## 4. Search results appear below brand text
- **File:** `src/renderer/src/components/Search/SpotlightSearchBar.tsx`
- **Issue:** The `SearchResultsList` renders below the search bar but above the brand text. Since the brand is on `z-0` and search on `z-10`, results float over the brand text — visually confusing.
- **Fix idea:** Hide brand content when search is focused (already partially done via `showBrand={!isDocked}`, but should also hide when `isFocused`).

## 6. Document fulfillment: export button is a stub
- **File:** `src/renderer/src/components/DocumentFulfillmentCard/DocumentFulfillmentCard.tsx`
- **Issue:** The "Yuklab olish (.docx)" button in the done view only shows a confirmation message — it doesn't generate an actual .docx file. Real docx generation requires backend integration (templates, docx library, file save dialog via IPC).
- **Fix idea:** Wire to backend docx generation + Electron IPC save dialog. Requires Phase 5+ IPC wiring.

## 7. Framer Motion layoutId transitions between relative and fixed positioning
- **File:** `src/renderer/src/components/Search/SpotlightSearchBar.tsx`
- **Issue:** The search bar switches between `position: static` (centered) and `position: fixed` (docked). Framer Motion's `layout` prop has limited support for animating between these positioning contexts, which can cause the element to jump during transition.
- **Fix idea:** Keep the search bar in one positioning context (always fixed, or use Framer Motion's `AnimatePresence` with distinct keys for centered vs docked variants).
