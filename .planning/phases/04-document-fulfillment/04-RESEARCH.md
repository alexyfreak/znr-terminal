# Phase 4: Document Fulfillment View — Research

## Design Spec (Section 8.5 DocumentPane)
- Paper sheet: bg #FAFAF7, paper-noise texture, text #1A1A1A
- Font: Times New Roman, serif
- Padding: 56px all sides
- Shadow: 0 40px 80px -20px rgba(0,0,0,0.7) + 0 8px 20px rgba(0,0,0,0.4)
- Border radius: 2px
- Animation: spring stiffness 160, damping 24, 0.15s delay
- Container max-w-[820px], max-h-[88vh]

## Beta Reference Patterns
- ContentPanel.tsx — multi-step form flow (select→fields→preview→done)
- FieldCollector.tsx — step-based field entry with validation, auto-fill, progress bar
- Field schema: required/optional fields with display names, field ordering, complex steps

## Phase 4 Plan
Wave 1: DocumentFulfillmentCard (paper styling) + FieldCollector (ported)
Wave 2: VersionPicker + completion state + wiring

## Key Adaptations from Beta
- Use Zunoora design tokens instead of inline colors
- Paper styling with paper-noise, serif font
- Field inputs styled with design system (hairline borders, surface backgrounds)
- Step progress bar with warm accent color
