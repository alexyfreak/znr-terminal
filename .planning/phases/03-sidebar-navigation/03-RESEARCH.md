# Phase 3: Sidebar & Navigation — Research

## Current State
Sidebar already has:
- Collapsed (60px) / expanded (260px) with spring animation
- Diamond toggle button
- Brand "ZUNOORA" label
- History section placeholder (clock icon / "Tarix" label)
- Bottom buttons (new chat, settings, account)
- State persisted via Zustand + localStorage

## What's Missing (per requirements)
- **SIDEBAR-05**: HistoryList with placeholder items, most recent first
- Diamond toggle should rotate (animate between collapsed→expanded)
- Credits row at bottom (per design spec)
- Active state for history items (#1A1A1A bg per design spec)
- Button onClick handlers (even if stubbed)
- Sidebar scroll area for history list

## Design Spec (8.2 Sidebar)
- History items: 12px font, 8px pad, 10px gap
- Active item: #1A1A1A bg
- Hover: reveal actions (📥🗑)
- Credits: warm diamond + number
- New chat: 8px pad, hover #1A1A1A
- Button spec from SKILL.md: Sidebar item pattern with hover bg

## Implementation Tasks
1. Update Sidebar.tsx — diamond rotate animation, scroll area, credits row
2. Create HistoryList component with placeholder data and date labels
3. Add button onClick stubs (clear search for "new chat", placeholder for settings/account)
4. Add placeholder seed data to useHistoryStore
