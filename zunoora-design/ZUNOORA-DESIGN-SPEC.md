# ZUNOORA — Complete Design Specification

> Use this document to recreate the Zunoora design system in Figma.
> Every color, measurement, shadow, animation, and component state is included.

---

## 1. COLOR PALETTE

### 1.1 Core Brand Colors

| Token | OKLCH | HEX | Role |
|-------|-------|-----|------|
| `--carbon` | `oklch(0.12 0 0)` | **#0A0A0A** | Page background |
| `--surface` | `oklch(0.16 0 0)` | **#111111** | Card / panel background |
| `--surface-hover` | `oklch(0.20 0 0)` | **#1A1A1A** | Hover state background |
| `--warm` | `oklch(0.94 0.015 85)` | **#F5F1E8** | Primary accent (warm off-white) |
| `--foreground` | `oklch(0.93 0 0)` | **#EDEDED** | Primary text |
| `--muted-foreground` | `oklch(0.60 0 0)` | **#8A8A8A** | Secondary/subtle text |

### 1.2 Extended Palette

| Token | Value | HEX | Role |
|-------|-------|-----|------|
| `--hairline` | `oklch(1 0 0 / 0.06)` | `rgba(255,255,255,0.06)` | Subtle borders / dividers |
| `--sidebar` | `oklch(0.10 0 0)` | **#080808** | Sidebar background |
| `--popover` | `oklch(0.14 0 0)` | **#0E0E0E** | Popover/dropdown background |
| `--input` | `oklch(1 0 0 / 0.08)` | `rgba(255,255,255,0.08)` | Input border surface |
| `--destructive` | `oklch(0.62 0.22 25)` | **#C84A4A** (approx) | Delete / destructive actions |
| `--paper-bg` | — | **#FAFAF7** | Document preview paper |
| `--paper-text` | — | **#1A1A1A** | Text on paper |

### 1.3 Selection Color

| Property | Value |
|----------|-------|
| Background | `oklch(0.94 0.015 85 / 0.25)` = warm at 25% opacity |
| Color | Inherited |

---

## 2. TYPOGRAPHY

### 2.1 Font Family

| Usage | Font Stack | Weight Available |
|-------|-----------|-----------------|
| **UI text** | `Inter`, ui-sans-serif, system-ui, sans-serif | 400 (Regular), 500 (Medium), 600 (Semi-Bold) |
| **Decorative labels** | `"Times New Roman"`, Times, serif | Italic (400) |
| **Document preview** | `"Times New Roman"`, Times, serif | 400, 600 |

Font source: `@fontsource/inter` (400, 500, 600 CSS packages)

### 2.2 Type Scale (all UI sizes)

| Figma Style Name | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| `label-tiny` | **10px** | 400 italic (serif) | `0.3em` | Section headers, assistant byline |
| `label-tiny-mono` | **10px** | 400 italic (serif) | `0.25em` | Assistant byline in chat |
| `label-small` | **11px** | 400 | `0.2em` | Sort button, status labels |
| `label-xs` | **12px** | 500 | — | Sidebar items, history text |
| `label-xs-serif` | **12px** | 400 italic (serif) | — | Credits label |
| `body-sm` | **14px** | 400 | — | Chat messages, paragraphs |
| `body-sm-medium` | **14px** | 500 | — | Brand name |
| `body-base` | **16px** | 400 | — | Input text (mobile) |
| `heading-sm` | **18px / text-lg** | 400 italic (serif) | — | Dialog titles |
| `heading-xs` | **17px** | 600 | `0.02em` uppercase | h2 in document preview |
| `heading-md` | **20px** | 600 | — | Error/404 heading |
| `heading-lg` | **24px / text-2xl** | 500 | `-0.025em` (tight) | Page titles |
| `heading-xl` | **28px** | 400 | `-0.01em` | h1 in document preview |
| `display` | **30px / text-3xl** | 500 | — | Stat numbers |
| `display-large` | **72px / text-7xl** | 700 | — | 404 page number |

### 2.3 Special Text Treatments

| Utility | Properties |
|---------|-----------|
| `.serif-italic` | `Times New Roman, Times, serif`, `font-style: italic`, `font-feature-settings: "kern"`, `letter-spacing: 0.01em` |
| `tracking-[0.2em]` | Letter-spacing: `0.2em` (brand name) |
| `tracking-[0.25em]` | Letter-spacing: `0.25em` (byline) |
| `tracking-[0.3em]` | Letter-spacing: `0.3em` (section headers) |
| `tracking-tight` | Letter-spacing: `-0.025em` |
| `tracking-wide` | Letter-spacing: `0.025em` |
| Bold in assistant text | Rendered as warm color `#F5F1E8` instead of bold weight |
| `tab-nums` (tabular-nums) | For numbers (credits value) |

---

## 3. SPACING SYSTEM

| Tailwind Class | px | Usage |
|---|---|---|
| `gap-0.5` | **2px** | History list item gap |
| `p-1` | **4px** | Toggle pill inner padding |
| `gap-1` | **4px** | Filter button gap |
| `px-1` | **4px** | Textarea horizontal padding |
| `py-1` | **4px** | Scroll area, brand top padding |
| `gap-1.5` | **6px** | Button icon-text gap, filter gap |
| `px-2` | **8px** | List container horizontal |
| `py-2` | **8px** | History items, sidebar buttons |
| `pb-2` | **8px** | Filter bottom, input bottom |
| `pt-2` | **8px** | Dialog body top |
| `gap-2` | **8px** | Brand logo gap, new chat button |
| `px-2.5` | **10px** | Ghost button, settings button |
| `py-2.5` | **10px** | Chat bubble, input row |
| `gap-2.5` | **10px** | Sidebar list button gap |
| `p-3` | **12px** | Calendar padding |
| `px-3` | **12px** | Chat input area, filter row |
| `py-3` | **12px** | Panel header bottom |
| `pb-3` | **12px** | Compact input bottom |
| `pt-3` | **12px** | Center mode input top |
| `gap-3` | **12px** | Account dialog label gap |
| `px-4` | **16px** | Chat transcript sides, corner header |
| `py-4` | **16px** | Scroll area top/bottom |
| `p-4` | **16px** | CarbonCard, PopoverContent |
| `pt-4` | **16px** | Center stage top |
| `gap-4` | **16px** | Message list gap, dialog rows |
| `px-5` | **20px** | Brand, history header, panel header |
| `py-5` | **20px** | Brand top/bottom |
| `px-6` | **24px** | Center stage horizontal, main stage |
| `py-6` | **24px** | Empty state padding |
| `pb-6` | **24px** | Center stage bottom |
| `pt-6` | **24px** | Model toggle top, content top |
| `px-8` | **32px** | Dashboard content horizontal |
| `pb-8` | **32px** | Dashboard content bottom |
| `px-14` | **56px** | Paper sheet horizontal |
| `py-10` | **40px** | Document pane vertical |
| `py-14` | **56px** | Paper sheet vertical |

---

## 4. BORDER RADIUS

| Token / Class | Value | Usage |
|---|---|---|
| `--radius-sm` | **6px** (`0.375rem`) | History items, ghost button, input, popover content |
| `--radius-md` | **8px** (`0.5rem`) | Activity items, some hover cards |
| `--radius-lg` = `--radius` | **10px** (`0.625rem`) | Default root radius |
| `--radius-xl` | **14px** (`0.875rem`) | Extended radius |
| `rounded-sm` | **2px** | Paper sheet |
| `rounded-lg` | **8px** | Activity item |
| `rounded-xl` | **12px** | CarbonCard |
| `rounded-2xl` | **16px** | ChatPanel corner, ChatInput, CarbonPanel, user bubble |
| `rounded-full` | **9999px** | Toggle pill, buttons, send button, download button |
| `rounded-br-md` | **6px** bottom-right only | User speech bubble (creates asymmetry) |

---

## 5. SHADOWS

| Name | Value | Used On |
|------|-------|---------|
| `shadow-none` | none | Center mode ChatPanel |
| `shadow-sm` | Default Tailwind small shadow | Input, Switch |
| `shadow-md` | Default Tailwind medium shadow | PopoverContent |
| `shadow-lg` | Default Tailwind large shadow | DialogContent, Switch thumb |
| `panel-shadow` | `0 8px 30px -12px rgba(0,0,0,0.6)` | ChatInput, CarbonPanel |
| `chat-corner-shadow` | `0 30px 80px -20px rgba(0,0,0,0.9)` | ChatPanel corner mode |
| `paper-shadow` | `0 40px 80px -20px rgba(0,0,0,0.7), 0 8px 20px rgba(0,0,0,0.4)` | Document paper sheet |

---

## 6. BACKDROP FILTERS

| Level | CSS | Used On |
|-------|-----|---------|
| `backdrop-blur-sm` | `blur(4px)` | Toggle pill, ModelToggle |
| `backdrop-blur-md` | `blur(12px)` | ChatInput, CarbonPanel |
| `backdrop-blur-xl` | `blur(24px)` | ChatPanel corner mode |

---

## 7. Z-INDEX STACK

| Value | Element |
|-------|---------|
| `z-0` | DocumentPane (paper area) |
| `z-10` | ChatPanel (center mode) |
| `z-20` | ModelToggle |
| `z-30` | ChatPanel (corner mode) |
| `z-50` | DialogOverlay, DialogContent, PopoverContent |

---

## 8. COMPONENT SPECIFICATIONS

### 8.1 AppShell
```
┌─────────────────────────────────────────────────────┐
│  ┌──────────┐  ┌──────────────────────────────────┐ │
│  │ Sidebar  │  │           MainStage               │ │
│  │ 260px    │  │      (flex-1, desk-vignette)       │ │
│  │          │  │                                    │ │
│  │          │  │   [Model Toggle]                   │ │
│  │          │  │                                    │ │
│  │          │  │    ┌──────────┐ or ┌──────────┐   │ │
│  │          │  │    │  Chat    │    │  Chat   │   │ │
│  │          │  │    │  Center  │    │  Corner │   │ │
│  │          │  │    │  72vh    │    │ 460x380 │   │ │
│  │          │  │    │  max-w-  │    │ + Paper │   │ │
│  │          │  │    │  2xl     │    │ Sheet   │   │ │
│  └──────────┘  └──────────────────────────────────┘ │
└─────────────────────────────────────────────────────┘
```

**Container:** `flex h-screen w-full overflow-hidden bg-[var(--carbon)] text-foreground`

---

### 8.2 Sidebar

**Dimensions:** 260px wide × 100vh tall
**Background:** `#080808` (--sidebar)
**Border:** Right side only, color: `rgba(255,255,255,0.06)` (--hairline)
**Layout:** `flex flex-col`

```
┌─────────────────────────────┐
│  ◆ ZUNOORA                  │  ← brand: 20px pad, 8px gap
│                             │
│  HISTORY                    │  ← serif-italic 10px/0.3em
│  [Any date] [new↓]         │  ← ghost buttons, 12px pad
│                             │
│  ┌─────────────────────┐    │
│  │ Chat title          │    │  ← 10px/8px pad, 12px font
│  │ 2m ago · 1 doc      │    │     active: #1A1A1A bg
│  │                📥🗑 │    │     hover: reveal actions
│  ├─────────────────────┤    │
│  │ Chat title          │    │
│  │ 5h ago              │    │
│  └─────────────────────┘    │
│                             │
│  ─────────────────────────  │  ← hairline top border
│  + New chat                 │  ← 8px pad, hover: #1A1A1A
│  ⚙ Settings                 │
│  👤 Teacher Name            │
│  ◆ credits  42              │  ← warm diamond + number
└─────────────────────────────┘
```

---

### 8.3 ChatPanel — Center Mode

**State:** idle (no document generated)
**Position:** `relative`, `z-10`
**Dimensions:** 100% width, `max-width: 672px` (max-w-2xl), `height: 72vh`
**Background:** none (transparent)
**Animation:** spring `{ stiffness: 180, damping: 26 }`

```
         ┌────────────────────────────────────┐
         │                                    │
         │       serif-italic "Zunoora"       │
         │                                    │
         │   What shall we draft today?       │  ← 24px/500
         │                                    │
         │   A lesson plan, a quiz...         │  ← 14px muted
         │                                    │
         │                                    │
         │  ┌──────────────────────────────┐  │
         │  │ 📎 Ask Zunoora to draft... ↑ │  │  ← input panel
         │  └──────────────────────────────┘  │
         └────────────────────────────────────┘
```

**Input Panel (center):**
- `rounded-2xl` (16px), hairline border
- Surface at 80% opacity, medium backdrop blur
- Shadow: `0 8px 30px -12px rgba(0,0,0,0.6)`
- Textarea max-height: 180px

---

### 8.4 ChatPanel — Corner Mode

**State:** generating or ready
**Position:** `fixed`, `bottom: 24px`, `right: 24px`, `z-30`
**Dimensions:** `380px` wide × `460px` tall
**Background:** `#0A0A0A` at 95% opacity
**Border:** hairline, `rounded-2xl` (16px)
**Shadow:** `0 30px 80px -20px rgba(0,0,0,0.9)`
**Backdrop:** `backdrop-blur-xl`

```
 ┌─────────────────────────────────┐
 │ CONVERSATION                ⛶  │  ← corner header
 ├─────────────────────────────────┤
 │                                 │
 │  ┌─────────────────────────┐    │  ← user bubble
 │  │ User message            │    │     80% max-width
 │  └─────────────────────────┘    │     #1A1A1A bg
 │                                 │     16px radius, asymmetric br
 │  Zunoora —                     │  ← byline 10px serif italic
 │  Assistant response text...     │     warm bold spans
 │                                 │
 │  composing ● ● ●               │  ← thinking dots
 │                                 │
 │  ┌──────────────────────────┐   │
 │  │ 📎 Refine or ask…     ↑ │   │  ← input, max 100px
 │  └──────────────────────────┘   │
 └─────────────────────────────────┘
```

**Input Panel (compact):**
- Same panel style but textarea max-height: 100px

---

### 8.5 DocumentPane (Paper Sheet)

**State:** generating or ready
**Animation:** spring fade in `{ stiffness: 160, damping: 24 }`, 0.15s delay
**Position:** absolute inset-0, `z-0`
**Container Max:** `max-h-[88vh]`, `max-w-[820px]`

```
┌─────────────────────────────────────────────┐
│ Composing your document…  ━━━━━━  [DL docx] │  ← status bar
│                                              │
│  ┌─────────────────────────────────────────┐ │
│  │                                         │ │
│  │      DOCUMENT TITLE (28px/400)          │ │  ← paper #FAFAF7
│  │                                         │ │
│  │  SECTION HEADER (17px/600/uppercase)    │ │  ← 56px padding
│  │  #555 color                             │ │
│  │                                         │ │
│  │  Body text (15px/1.75 leading)          │ │
│  │  Times New Roman, #1A1A1A              │ │
│  │                                         │ │
│  │  1. List item                           │ │
│  │  2. List item                           │ │
│  │                                         │ │
│  │  ───────────────────────                │ │
│  │                                         │ │
│  │  More text... ▏                         │ │  ← blink cursor
│  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────┘
```

**Paper Sheet Detail:**
- Background: `#FAFAF7` with `paper-noise` texture (3px + 7px dot patterns)
- Text: `#1A1A1A`
- Font: Times New Roman, Times, serif
- Padding: 56px all sides
- Shadow: dual layer `0 40px 80px -20px rgba(0,0,0,0.7)` + `0 8px 20px rgba(0,0,0,0.4)`
- Border radius: 2px

---

### 8.6 ModelToggle

```
        ┌─────────────────────────────────┐
        │  [■ Standard Output] Deep Analy │  ← pill 60% surface
        └─────────────────────────────────┘     backdrop-blur-sm
```
- Pill container: `rounded-full`, hairline border, #111111 at 60% opacity
- Padding: 4px all sides
- Active pill: `#F5F1E8` bg, `#0A0A0A` text, animated with `layoutId`
- Inactive: `#8A8A8A` text
- "Standard Output": Inter 500, "Deep Analysis": serif italic
- Active pill animation: spring `{ stiffness: 380, damping: 32 }`

---

### 8.7 Button Variants

**Ghost Button**
```
[icon] Label text
```
- `11px` font, hairline border, `6px` radius
- Padding: `10px` horizontal, `6px` vertical
- Text: `#8A8A8A`
- Hover: bg fills `#1A1A1A`, text `#EDEDED`

**Warm Button (Send)**
```
     ┌─────┐
     │  ↑  │  ← 36×36px circle
     └─────┘
```
- `36×36px`, `rounded-full`, `#F5F1E8` bg
- Icon: `#0A0A0A`, stroke-width: 2.2
- Disabled: 30% opacity

**Icon Button**
```
     ┌─────┐
     │  📎 │  ← 36×36px circle
     └─────┘
```
- `36×36px`, `rounded-full`
- Text: `#8A8A8A`
- Hover: bg fills `#1A1A1A`, text `#EDEDED`

**Small Icon Button (corner)**
```
  ┌──────┐
  │  ⛶  │  ← 28×28px, 6px radius
  └──────┘
```

**Sidebar Button (settings/account)**
```
  ⚙ Settings     ← 12px, #8A8A8A
```
- Full width, `10px/8px` padding, `6px` radius
- Hover: bg `#111111`, text `#EDEDED`

**Sidebar Action Button (new chat)**
```
  + New chat     ← 12px/500, #EDEDED
```
- Full width, `10px/8px` padding, `6px` radius
- Hover: bg `#1A1A1A`

**Download Button**
```
 [📥 Download .docx]   ← 11px rounded-full
```
- `rounded-full`, hairline border
- Padding: `12px` horizontal, `6px` vertical
- Text: `#8A8A8A`, Hover: text `#EDEDED`
- Disabled: 50% opacity

---

### 8.8 Date Filter Popover

```
Trigger button (ghost style, 11px):
  [📅 Any date]

Opened popover:
 ┌───────────────────┐
 │  December 2025    │  ← Calendar (shadcn DayPicker)
 │ Mo Tu We Th Fr Sa │
 │     1  2  3  4  5 │
 │  6  7  8  9 10 11 │
 │ ...               │
 └───────────────────┘
```
- Trigger: same as ghost button, 11px font
- Calendar icon: 12×12px, stroke-width 1.5
- Clear X button: 14×14px grid, 2px radius

---

### 8.9 History List Item

```
┌─────────────────────────────────────┐
│ Chat title (truncated)        📥 🗑 │  ← visible on hover
│ 2m ago · 1 doc                     │
└─────────────────────────────────────┘
```
- Padding: `10px` horizontal, `8px` vertical
- Font: `12px`, `6px` radius
- Active bg: `#1A1A1A`, active text: `#EDEDED`
- Inactive text: `#8A8A8A`
- Inactive hover: bg `#111111`, text `#EDEDED`
- Actions: hidden by default, `opacity-0`, show `opacity-100` on group hover
- Action buttons: 24×24px grid, 4px radius
- Delete hover: `#C84A4A` text color

---

### 8.10 Dialogs (Settings / Account)

```
 ┌──────────────────────────────────┐
 │  ✕                               │
 │  Settings                         │  ← serif italic 18px
 │                                  │
 │  Dense sidebar        [switch]   │  ← 14px row labels
 │  Reduced motion       [switch]   │
 │                                  │
 │  Default model is set per-chat.. │  ← 12px muted text
 └──────────────────────────────────┘
```
- Dialog content: `#111111` bg, hairline border
- Max-width: `512px` (max-w-lg), centered on screen
- Padding: 24px
- Title: `serif-italic text-lg font-normal` (18px serif italic)
- Body gap: 16px (settings), 12px (account)
- Input fields: shadcn Input component (see section 8.12)

---

### 8.11 Switch (shadcn)

```
Unchecked:  ○────────────────  (20×36px, rgba(255,255,255,0.08) bg)
Checked:    ────────────────●  (20×36px, #F5F1E8 bg)
```
- Track: 20×36px, `rounded-full`, border 2px transparent
- Thumb: 16×16px circle, `#0A0A0A` bg, `shadow-lg`
- Checked: thumb translates right 16px

---

### 8.12 Input (shadcn)

```
┌──────────────────────────────────┐
│  Label text                      │  ← 12px muted foreground
│ ┌──────────────────────────────┐ │
│ │ Text value                   │ │  ← 36px tall, 6px radius
│ └──────────────────────────────┘ │     rgba(255,255,255,0.08) border
└──────────────────────────────────┘     transparent bg
```
- Height: 36px
- Border radius: 6px
- Border: `rgba(255,255,255,0.08)`
- Background: transparent
- Text: 16px (mobile), 14px (desktop)
- Focus ring: `#F5F1E8`, 1px
- Placeholder: `#8A8A8A`

---

### 8.13 Chat Messages

**User Message:**
```
  ┌───────────────────────────┐
  │ User text goes here       │  ← right-aligned (self-end)
  └───────────────────────────┘     80% max-width
```
- Background: `#1A1A1A`
- Border radius: `16px` top, `16px` left, `16px` right, `6px` bottom-right (asymmetric)
- Padding: `16px` horizontal, `10px` vertical
- Font: 14px, `#EDEDED`
- Animation: fade up 6px over 250ms

**Assistant Message:**
```
Zunoora —                              ← 10px serif italic uppercase
Assistant response with **warm bold**   ← 14px
```
- Full width
- Byline: 10px serif italic, uppercase, 0.25em tracking, `#8A8A8A` at 70%
- Bold text rendered in warm color `#F5F1E8` (not bold weight)
- Preserved whitespace (`whitespace-pre-wrap`)
- Animation: same fade up 6px over 250ms

**Thinking Indicator:**
```
composing ● ● ●
```
- `composing` text: 12px serif italic, `#8A8A8A`
- Dots: 4×4px circles, `#8A8A8A`, `animate-pulse`
- Dot 2 delay: 120ms, Dot 3 delay: 240ms
- Fade in/out animation

---

## 9. ANIMATION CONFIGURATION

| Component | Animation | Type | Stiffness | Damping | Duration | Delay |
|-----------|-----------|------|-----------|---------|----------|-------|
| ChatPanel layout morph | Layout spring | spring | 180 | 26 | ~0.7s | — |
| ChatPanel corner header | Fade in/out | tween | — | — | auto | — |
| Each message | Fade + slide up 6px | tween | — | — | 0.25s | — |
| Thinking indicator | Fade in/out | tween | — | — | auto | — |
| Thinking dots | CSS pulse | — | — | — | 1s loop | 0/120/240ms |
| DocumentPane entry | Fade + slide 18px + scale 0.97 | spring | 160 | 24 | ~0.6s | 0.15s |
| Shimmer line | Width pulse | tween | — | — | 4s loop / 0.6s | — |
| Streaming cursor | CSS pulse | — | — | — | 1s loop | — |
| ModelToggle active pill | Layout morph | spring | 380 | 32 | ~0.35s | — |

---

## 10. ICON SYSTEM

**Library:** Lucide React
**Default strokeWidth:** `1.5` (most icons)
**Send button:** `strokeWidth={2.2}` (ArrowUp)
**Plus icon:** `strokeWidth={1.8}`

**Common Icon Sizes:**
| Size | px | Used On |
|------|-----|---------|
| `h-2 w-2` | 8×8 | Activity dot |
| `h-2.5 w-2.5` | 10×10 | Clear date X, brand diamond |
| `h-3 w-3` | 12×12 | Calendar, ArrowUpDown, Download, Trash |
| `h-3.5 w-3.5` | 14×14 | Settings, User, Plus, Maximize2 |
| `h-4 w-4` | 16×16 | Paperclip, ArrowUp (send), Close X |

**Icons Used:** Paperclip, ArrowUp, Plus, Maximize2, Calendar, ArrowUpDown, Download, Trash2, Settings, User, X

---

## 11. CUSTOM CSS UTILITIES

### paper-noise
```
background-image:
  radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
  radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
background-size: 3px 3px, 7px 7px;
background-position: 0 0, 1px 2px;
```

### desk-vignette
```
background:
  radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.025), transparent 60%),
  radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6), transparent 70%);
```

### serif-italic
```
font-family: "Times New Roman", Times, serif;
font-style: italic;
font-feature-settings: "kern";
letter-spacing: 0.01em;
```

---

## 12. DOCUMENT PREVIEW (PROSE) STYLES

These are the embedded styles for the `.prose-doc` class on the paper sheet:

| Element | Font Size | Weight | Color | Other |
|---------|-----------|--------|-------|-------|
| `h1` | 28px | 400 (regular) | inherited (#1A1A1A) | margin: 0 0 18px, letter-spacing: -0.01em |
| `h2` | 17px | 600 (semi-bold) | #555 | font-family: Inter, sans-serif, margin: 28px 0 10px, letter-spacing: 0.02em, text-transform: uppercase |
| `p` | 15px | 400 | inherited | line-height: 1.75, margin: 0 0 12px |
| `ol` | — | — | — | padding-left: 22px, margin: 0 0 14px |
| `li` | 15px | 400 | inherited | line-height: 1.7, margin-bottom: 4px |
| `hr` | — | — | — | border: 0, border-top: 1px solid #ddd, margin: 28px 0 |
| `em` | — | italic | #555 | — |
| `strong` | — | 600 | inherited | — |

---

## 13. SHADCN UI PRIMITIVES (used by app)

### Popover Content
- Width: 288px, rounded-md (6px)
- Background: `#0E0E0E`, text: `#EDEDED`
- Shadow: `shadow-md`, padding: 16px
- Animation: fade + zoom (95→100%) + slide from trigger
- sideOffset: 4px

### Dialog Overlay
- `fixed inset-0 z-50`, `bg-black/80`
- Fade animation

### Dialog Content
- Centered `left-[50%] top-[50%] translate-x-[-50%] translate-y-[-50%]`
- Max-width: 512px, padding: 24px, gap: 16px
- Border radius: 8px (sm+)
- Animation: fade + zoom (95→100%)

---

## 14. GRID / LAYOUT REFERENCE

### App Shell Layout
```
flex-row (default flex)
├── Sidebar: 260px fixed
│   └── flex-col
└── Main: flex-1
    └── flex-col
        ├── ModelToggle (z-20, centered, pt-6)
        └── Center stage (flex-1, centered, px-6 pb-6 pt-4)
            ├── DocumentPane (absolute inset-0, z-0)
            └── ChatPanel (z-10 center, or z-30 fixed corner)
```

### Dashboard Layout (example)
```
CarbonPage → flex-row
├── Sidebar: 260px
└── CarbonMain → flex-col desk-vignette
    ├── Top bar (flex justify-between, px-8 pt-6)
    ├── Stats row (grid grid-cols-3 gap-4 px-8 pt-6)
    └── Content (grid grid-cols-2 gap-4 px-8 pt-6 pb-8 flex-1)
```

---

## 15. STATE MACHINE

```
         ┌─────────┐
         │  idle   │  ← initial: ChatPanel center, no document
         └────┬────┘
              │ onSend()
              ▼
         ┌────────────┐
         │ generating │  ← ChatPanel → corner (460×380, fixed br)
         └─────┬──────┘     DocumentPane appears (streaming)
               │ document_ready event
               ▼
         ┌─────────┐
         │  ready  │  ← ChatPanel stays corner, DocumentPane complete
         └────┬────┘
              │ onExpand() or newChat()
              ▼
         ┌─────────┐
         │  idle   │
         └─────────┘
```

---

*End of Design Specification*
