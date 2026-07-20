---
name: brand-design-system
description: Apply this brand's exact monochrome design system when building, designing, or reviewing ANY UI for Zunoora products (document assistant, znr-terminal, Zunoora Read, or any new screen/component/dashboard). ALWAYS use this skill for visual work — even casual requests like "make a page for X", "build a component", "add a button", or "design a modal" — since every color, font, radius, and spacing decision must come from this system, not from defaults or guesswork. This replaces any prior blue/gold palette assumption: the current system is black/white/gray with color reserved strictly for semantic status (info/error/warning/success) and tags.
---

# Zunoora Design System

This is the **complete, exact visual language** for Zunoora UI — extracted via pixel sampling from the reference component sheet, not approximated. Every value below (hex, radius, spacing) is the real value from that reference. Do not invent alternatives, and do not default to a previous blue/gold palette — that system has been retired in favor of this one.

Output format: **Tailwind CSS** (utility classes + a small `theme.extend` block), matching the React/Vite/Tailwind stack.

---

## 1. Philosophy

- **Monochrome-first, color-as-signal**: the base UI is black, near-black, and white/gray. Color (blue, red, gold, green) appears *only* to communicate status (alerts) or as tag/category markers — never as decorative branding accents.
- **Flat, not glassy**: no gradients, no glow, no colored shadows. Depth comes from layering three near-black tones, not from light effects.
- **Contrast-adaptive buttons**: a "Main"/primary button is always the *opposite* extreme of whatever surface it sits on — near-white fill on a dark surface, near-black fill on a light/cream surface. Never a mid-gray button.
- **Two typeface systems, picked by context** (see §3) — a serif system for document/editorial content (this matches the document-assistant product's generated `.docx` output), and a sans system for app/product chrome (dashboards, lists, nav). Never mix them on the same surface.
- **Pill shapes for actions, soft-rounded rects for containers.** Buttons and tags are fully rounded (stadium shape); cards/modals/inputs use moderate radius.

> If it looks colorful, glassy, or uses blue/gold as a brand accent — it's wrong for this system.

---

## 2. Color System (exact hex, pixel-sampled)

### Background layers (the core of the system)
| Token | Hex | Usage |
|---|---|---|
| `zn-page` | `#0A0A0A` | Page/app background — near-black, never pure `#000` |
| `zn-surface` | `#131313` | Panels, modals, search bar, default list rows, sidebar |
| `zn-elevated` | `#181818` | Inputs/textareas, hover states, unselected chips |
| `zn-border` | `rgba(255,255,255,0.10)` | Hairline dividers, input borders, sidebar outline |

### Text on dark
| Token | Hex | Usage |
|---|---|---|
| `zn-text` | `#FFFFFF` / `#EDEDED` | Primary text, headers |
| `zn-text-muted` | `#9A9A9A` | Secondary/description text (e.g. "there goes some description") |
| `zn-text-faint` | `#6B6B6B` | Placeholder, least-emphasis paragraph |

### Semantic alert colors (background tint / solid icon-accent / label text)
| State | Background tint | Icon / solid accent | Label text |
|---|---|---|---|
| Info | `#1D3F5A` | `#779FE5` | `#7C9EE6` |
| Error | `#3A1011` | icon chip is a dark red square (`#430B0E`) with white glyph | `#BF2428` |
| Warning | `#5C4416` | `#FCA800` | `#F7A500` |
| Success | `#1C3C13` | `#75F94D` | `#7AF253` |

Pattern: alert box = `bg: <tint>` + a small square icon chip in the solid accent color + bold white message text + the state name/label rendered in the label-text color.

### Light-surface variant (for cards that need to pop against the dark page)
| Token | Hex | Usage |
|---|---|---|
| `zn-cream` | `#F3EFE4` | Light "paper" card background (e.g. a promo/onboarding card) |
| `zn-cream-text` | `#1D1D1D` | Text on cream — near-black, not pure black |
| `zn-cream-embed` | `#B6B5B0` | A secondary gray card/popover embedded *on top of* a cream card |

### Muted tag/pill swatches (used for category tags, distinct from alert colors — desaturated so they sit quietly on light or neutral fills)
| Token | Hex |
|---|---|
| `zn-tag-blue` | `#7B9BB0` |
| `zn-tag-red` | `#976B68` |
| `zn-tag-orange` | `#BAA06D` |
| `zn-tag-green` | `#79996A` |

### Do NOT use
- Pure `#000000` for page background (always `#0A0A0A`)
- Any blue/gold as a *branding* accent (`#395AFD`, `#F5A524` are retired — reserve blue only for Info, gold only for Warning)
- Colored shadows/glows
- Mid-gray buttons — primary buttons are always near-white or near-black, contrast-adaptive

---

## 3. Typography

### Two systems — pick by context, never mix on one surface

| System | Font | Use for |
|---|---|---|
| **Editorial / Serif** | `Newsreader` (best visual match) | Document-assistant generated content, the `Zunoora` wordmark, any "content you'd print or export" |
| **UI / Sans** | `Inter` (best visual match) | App chrome: dashboards, nav, list items, buttons, search, modals, znr-terminal output |

> Font names above are a best-visual-match assumption (serif headline + sans body/UI), not confirmed against the original design file. If exact brand fonts exist elsewhere, swap them in here without changing the rest of the system.

```html
<link href="https://fonts.googleapis.com/css2?family=Newsreader:ital,wght@0,400;0,600;1,400;1,600&family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
```

### Type scale (both systems share these steps; swap `font-family` only)

| Element | Size | Weight | Notes |
|---|---|---|---|
| Header 1 | `2.75rem`–`3.5rem` | 400 (serif) / 700 (sans) | Serif: elegant display. Sans: bold app-header |
| Header 2 | `2rem` | 400 / 700 | |
| Header 3 | `1.5rem` | 400 / 600 | |
| Header 4 | `1.25rem` | 400 / 600 | |
| Paragraph 1 | `1.125rem` | 400 | Full-opacity text (`zn-text`) |
| Paragraph 2 | `1rem` | 400 | Full-opacity |
| Paragraph 3 | `0.9375rem` | 400 | Slightly muted (`zn-text-muted`) |
| Paragraph 4 | `0.8125rem` | 400 | Faint/caption (`zn-text-faint`) |

Tailwind utility examples:
```html
<h1 class="font-serif text-5xl text-zn-text">Header 1</h1>
<h1 class="font-sans font-bold text-5xl text-zn-text">Header 1</h1> <!-- UI variant -->
<p class="font-sans text-[0.9375rem] text-zn-text-muted">Paragraph 3</p>
```

---

## 4. Radius & Spacing

| Context | Radius |
|---|---|
| Buttons, tag pills, chips | `9999px` (full pill) |
| Alert boxes | `10px` |
| Modal / dialog | `20px` |
| Cream card | `24px` |
| Search input | `14px` |
| List row hover outline | `14px` |
| Small popover/notification card | `16px` |

Spacing: 4px base grid. Alert box padding `16px 20px`. Modal padding `32px`. Card padding `24px`. List row padding `16px 20px`. Gap between stacked list rows: hairline `1px` divider (`zn-border`), no gap.

---

## 5. Tailwind config

```js
// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      colors: {
        'zn-page': '#0A0A0A',
        'zn-surface': '#131313',
        'zn-elevated': '#181818',
        'zn-border': 'rgba(255,255,255,0.10)',
        'zn-text': '#EDEDED',
        'zn-text-muted': '#9A9A9A',
        'zn-text-faint': '#6B6B6B',
        'zn-cream': '#F3EFE4',
        'zn-cream-text': '#1D1D1D',
        'zn-cream-embed': '#B6B5B0',
        'zn-info-bg': '#1D3F5A', 'zn-info-accent': '#779FE5', 'zn-info-text': '#7C9EE6',
        'zn-error-bg': '#3A1011', 'zn-error-accent': '#430B0E', 'zn-error-text': '#BF2428',
        'zn-warning-bg': '#5C4416', 'zn-warning-accent': '#FCA800', 'zn-warning-text': '#F7A500',
        'zn-success-bg': '#1C3C13', 'zn-success-accent': '#75F94D', 'zn-success-text': '#7AF253',
        'zn-tag-blue': '#7B9BB0', 'zn-tag-red': '#976B68', 'zn-tag-orange': '#BAA06D', 'zn-tag-green': '#79996A',
      },
      fontFamily: {
        serif: ['Newsreader', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        'zn-btn': '9999px',
        'zn-alert': '10px',
        'zn-modal': '20px',
        'zn-card': '24px',
        'zn-input': '14px',
        'zn-popover': '16px',
      },
    },
  },
}
```

---

## 6. Component Patterns

### Alert / message box
```html
<div class="flex items-center gap-3 rounded-zn-alert bg-zn-info-bg px-5 py-4">
  <span class="flex h-7 w-7 items-center justify-center rounded-md bg-zn-info-accent text-zn-page">i</span>
  <p class="font-sans font-semibold text-zn-text">Info message.</p>
</div>
<!-- swap bg-zn-info-bg / bg-zn-{error,warning,success}-* for other states -->
```

### Buttons (contrast-adaptive)
```html
<!-- Light/inverted pill: use when the button sits on a DARK surface -->
<button class="rounded-zn-btn bg-[#EDEDED] px-8 py-3 font-sans font-semibold text-zn-page">Button</button>

<!-- Dark outlined pill: alternate dark-surface treatment (border-forward) -->
<button class="rounded-zn-btn border border-white/80 bg-zn-page px-8 py-3 font-sans font-semibold text-white">Button</button>

<!-- Dark pill: use when the button sits on a LIGHT/cream surface -->
<button class="rounded-zn-btn bg-zn-page px-6 py-2.5 font-sans font-semibold text-white">Main button</button>
```

### Chip / tag selector (e.g. bug-report category picker)
```html
<button class="rounded-zn-btn border-2 border-zn-info-accent bg-[#21435E] px-5 py-2.5 font-sans text-sm text-zn-text">Interface bug</button>
<button class="rounded-zn-btn bg-zn-elevated px-5 py-2.5 font-sans text-sm text-zn-text-muted">Payment bug</button>
<!-- selected = accent-tinted fill + accent border ring; unselected = flat zn-elevated, no border -->
```

### Modal / dialog
```html
<div class="rounded-zn-modal bg-zn-surface p-8 shadow-2xl">
  <h2 class="font-sans text-2xl font-semibold text-zn-text mb-6">Report bug</h2>
  <textarea class="w-full rounded-zn-input bg-zn-elevated p-4 text-zn-text placeholder-zn-text-faint" placeholder="Describe the problem..."></textarea>
</div>
```

### Search input
```html
<div class="flex items-center gap-3 rounded-zn-input bg-zn-surface px-5 py-3">
  <SearchIcon class="text-zn-text-faint" />
  <input class="w-full bg-transparent font-sans text-zn-text placeholder-zn-text-faint" placeholder="Search..." />
</div>
```

### List row (default + hover/selected)
```html
<!-- Default: no fill difference from page, just a hairline bottom divider -->
<div class="flex items-baseline gap-3 border-b border-zn-border px-5 py-4">
  <span class="font-sans font-semibold text-zn-text">Blank 1</span>
  <span class="font-sans text-sm text-zn-text-muted">there goes some description</span>
</div>

<!-- Hover/selected: gains a full rounded outline, no divider needed -->
<div class="flex items-baseline gap-3 rounded-zn-input border border-zn-border bg-zn-elevated px-5 py-4">
  <span class="font-sans font-semibold text-zn-text">Blank 6</span>
  <span class="font-sans text-sm text-zn-text-muted">there goes some description</span>
</div>
```

### Sidebar nav
```html
<!-- Bordered outline container, NOT a filled panel — bg matches page -->
<div class="flex flex-col divide-y divide-zn-border rounded-zn-input border border-zn-border bg-zn-page">
  <button class="flex items-center gap-2 px-4 py-3 font-sans text-zn-text">+ New chat</button>
  <button class="flex items-center gap-2 px-4 py-3 font-sans text-zn-text-muted"><ProfileIcon/> Profile</button>
  <button class="flex items-center gap-2 px-4 py-3 font-sans text-zn-text-muted"><GearIcon/> Settings</button>
</div>
```

### Cream/light card + embedded popover
```html
<div class="rounded-zn-card bg-zn-cream p-8">
  <h1 class="font-serif text-4xl text-zn-cream-text">Header 1</h1>
  <!-- an embedded gray popover sits on TOP of the cream card: -->
  <div class="rounded-zn-popover bg-zn-cream-embed p-5">
    <p class="font-sans font-semibold text-zn-cream-text">Some text?</p>
    <p class="font-sans text-sm text-zn-cream-text/70">Details would appear here.</p>
    <button class="mt-3 w-full rounded-zn-btn bg-zn-page py-2.5 font-sans font-semibold text-white">Main button</button>
    <button class="mt-1 font-sans text-sm text-zn-info-text underline">Secondary</button>
  </div>
</div>
```

### Standalone notification/popover (on dark page)
```html
<div class="rounded-zn-popover bg-zn-surface p-5">
  <p class="font-sans font-semibold text-zn-text">Some text?</p>
  <p class="font-sans text-sm text-zn-text-muted">Details would appear here.</p>
  <button class="mt-3 w-full rounded-zn-btn bg-[#EDEDED] py-2.5 font-sans font-semibold text-zn-page">Main button</button>
  <button class="mt-1 font-sans text-sm text-zn-info-text underline">Secondary</button>
</div>
```

### Tag pills (category swatches)
```html
<span class="h-8 w-16 rounded-zn-btn bg-zn-tag-blue inline-block"></span>
<span class="h-8 w-16 rounded-zn-btn bg-zn-tag-red inline-block"></span>
<span class="h-8 w-16 rounded-zn-btn bg-zn-tag-orange inline-block"></span>
<span class="h-8 w-16 rounded-zn-btn bg-zn-tag-green inline-block"></span>
```

---

## 7. Do's and Don'ts

### ✅ Always
- `#0A0A0A` page bg, never pure black `#000`
- Reserve color strictly for alert-state / tag meaning — not decoration
- Main buttons flip to the opposite extreme of their surface (white-on-dark, black-on-light)
- Pill (`9999px`) radius on every button and tag
- Hairline `rgba(255,255,255,0.10)` dividers between list rows; switch to a full rounded outline only on hover/selected
- Pick ONE typeface system per surface (serif for document content, sans for app chrome)

### ❌ Never
- Blue (`#395AFD`) or gold (`#F5A524`) as a branding accent color (retired palette)
- Colored glows/shadows or gradients
- Mid-gray "primary" buttons
- Mixing serif and sans headers on the same screen
- Filled sidebar panels — the nav container is outline-only, matching page bg

---

## Quick Reference Card

```
PAGE:     #0A0A0A   SURFACE: #131313   ELEVATED: #181818
INFO:     bg #1D3F5A  accent #779FE5  text #7C9EE6
ERROR:    bg #3A1011  accent (icon chip) #430B0E  text #BF2428
WARNING:  bg #5C4416  accent #FCA800  text #F7A500
SUCCESS:  bg #1C3C13  accent #75F94D  text #7AF253
CREAM:    #F3EFE4 (bg)  #1D1D1D (text)  #B6B5B0 (embedded popover)
SERIF:    Newsreader → document content, wordmark
SANS:     Inter → app chrome, UI, lists, buttons
RADIUS:   pill buttons/tags · 20px modal · 24px cream card · 14px input/hover-row
BUTTON RULE: main button = opposite-contrast of its surface (white-on-dark / black-on-light)
```
