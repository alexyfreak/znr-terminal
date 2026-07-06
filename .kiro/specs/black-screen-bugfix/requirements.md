# Requirements: Black Screen and UI Bugs Fix

## Overview
Fix the Electron app startup black screen issue and resolve UI bugs in the Shablon Builder feature.

## Context
The Zunoora desktop app is experiencing:
1. Black screen on startup (both Electron and web versions initially)
2. Invisible text in the shablon template editor
3. FieldEditor component errors when adding fields
4. Electron app not reflecting web version fixes

## User Story
**As a** teacher using the Zunoora desktop app  
**I want** the app to start properly and display the UI correctly  
**So that** I can create and manage document templates without errors

## Functional Requirements

### FR1: App Startup
**Priority:** Critical  
**Status:** Partially Complete

The app must:
- Display the Zunoora interface immediately on startup
- Show the spotlight search bar in the center
- Load all components without JavaScript errors
- **Acceptance Criteria:**
  - No black screen on startup
  - No "Cannot access before initialization" errors
  - App loads within 3 seconds

**Current State:**
- ✅ Web version fixed (variable ordering issues resolved)
- ⚠️ Electron build needs to reflect fixes

### FR2: Shablon Template Editor
**Priority:** High  
**Status:** Complete

The template editor must:
- Display typed text visibly in the editor
- Show syntax highlighting for variables ({{variableName}})
- Maintain caret visibility
- **Acceptance Criteria:**
  - Text is visible as user types
  - Caret blinks and is visible at cursor position
  - Syntax highlighting works for {{variables}}

**Current State:**
- ✅ Fixed by updating backdrop color and adding WebkitTextFillColor

### FR3: FieldEditor Component
**Priority:** High  
**Status:** Needs Investigation

The field editor must:
- Allow adding new fields without errors
- Display field configuration UI
- Save field data to draft state
- **Acceptance Criteria:**
  - "Add field" button creates a new field
  - No React errors in console
  - Field data persists in store

**Current State:**
- ⚠️ Error: "An error occurred in the <FieldEditor> component"
- Needs complete error trace for diagnosis

### FR4: Electron Build Consistency
**Priority:** High  
**Status:** Pending

The Electron app must:
- Reflect all fixes applied to web version
- Build without errors
- Launch successfully on Windows
- **Acceptance Criteria:**
  - `npm run build` completes successfully
  - `npm run dev` shows fixed app
  - No console errors on launch

**Current State:**
- Build completes successfully
- Needs verification that fixes are included

## Non-Functional Requirements

### NFR1: Performance
- App startup time < 3 seconds
- Hot reload time in dev mode < 500ms

### NFR2: Developer Experience
- Clear error messages for debugging
- Build process completes without warnings
- Code follows React best practices (hooks ordering, dependencies)

### NFR3: Code Quality
- No hoisting issues (variables used before declaration)
- Proper TypeScript types
- React hooks with correct dependencies

## Technical Constraints
- Electron 43.0.0
- React 19.2.7
- Vite 7.3.6
- Windows OS
- PowerShell execution policy restrictions

## Dependencies
- Framer Motion for animations
- React i18next for translations
- Zustand for state management
- Tailwind CSS for styling

## Success Criteria
1. App starts without black screen (0% error rate)
2. All text visible in editors (100% text visibility)
3. All interactive components work without errors
4. Electron and web versions behave identically
5. Build process completes successfully

## Out of Scope
- New features or enhancements
- Performance optimizations beyond startup time
- UI/UX redesigns
- Database or backend changes
