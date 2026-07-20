# Zunoora Design System — AI Skill

> **Dark carbon theme · Warm accent · Inter + Times New Roman**
> Load this skill when building UI that must match the Zunoora visual identity.

---

## How to Use

When this skill is loaded, apply the tokens, components, and patterns below to any new page or component. Reference `ZUNOORA-DESIGN-SPEC.md` (in the same directory) for the complete Figma-ready spec.

---

## Quick Reference

### Core Colors

```
--carbon  #0A0A0A        page background
--surface #111111        card/panel bg
--surface-hover #1A1A1A  hover state
--hairline rgba(255,255,255,0.06)  borders
--warm    #F5F1E8        accent (buttons, active states)
--foreground #EDEDED     primary text
--muted-foreground #8A8A8A  secondary text
--sidebar #080808        sidebar bg
--paper-bg #FAFAF7       document paper
--paper-text #1A1A1A     text on paper
--destructive #C84A4A    delete/danger
```

### Font Stack

```css
--font-sans: "Inter", ui-sans-serif, system-ui, sans-serif;   /* UI text */
--font-serif: "Times New Roman", Times, serif;                /* labels + paper */
```

Weights: 400 (Regular), 500 (Medium), 600 (Semi-Bold).  
Serif italic used for decorative labels, bylines, dialog titles.

### Custom CSS Utilities

Always include in the CSS layer:

```css
.serif-italic {
  font-family: "Times New Roman", Times, serif;
  font-style: italic;
  font-feature-settings: "kern";
  letter-spacing: 0.01em;
}

.paper-noise {
  background-image:
    radial-gradient(rgba(0,0,0,0.04) 1px, transparent 1px),
    radial-gradient(rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 3px 3px, 7px 7px;
  background-position: 0 0, 1px 2px;
}

.desk-vignette {
  background:
    radial-gradient(ellipse at 50% 40%, rgba(255,255,255,0.025), transparent 60%),
    radial-gradient(ellipse at 50% 100%, rgba(0,0,0,0.6), transparent 70%);
}
```

### Tailwind Theme Tokens

```css
@theme inline {
  --color-carbon: var(--carbon);
  --color-surface: var(--surface);
  --color-surface-hover: var(--surface-hover);
  --color-hairline: var(--hairline);
  --color-warm: var(--warm);
}
```

---

## Layout Patterns

### App Shell (full-screen app)
```tsx
<div className="flex h-screen w-full overflow-hidden bg-[var(--carbon)] text-foreground">
  <Sidebar />   {/* 260px fixed */}
  <Main />      {/* flex-1 desk-vignette */}
</div>
```

### Page Section
```tsx
<main className="relative flex h-screen min-w-0 flex-1 flex-col desk-vignette">
  {/* header area */}
  {/* content area px-6 pb-6 pt-4 */}
</main>
```

### Centered Stage
```tsx
<div className="relative flex min-h-0 flex-1 items-center justify-center px-6 pb-6 pt-4">
  {/* centered content */}
</div>
```

---

## Reusable Classes (pick and apply anywhere)

### Cards & Panels
| Pattern | Classes |
|---------|---------|
| Card (12px radius) | `rounded-xl border border-[var(--hairline)] bg-[var(--surface)]` |
| Panel (16px radius, glass) | `rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]/80 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]` |
| Hover card | add `transition-colors hover:bg-[var(--surface-hover)]` |

### Buttons
| Variant | Classes |
|---------|---------|
| Ghost | `inline-flex items-center gap-1.5 rounded-md border border-[var(--hairline)] bg-transparent px-2.5 py-1.5 text-[11px] text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground` |
| Warm (send) | `grid h-9 w-9 place-items-center rounded-full bg-[var(--warm)] text-[var(--carbon)] transition-opacity disabled:opacity-30` |
| Icon (circle) | `grid h-9 w-9 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground` |
| Small icon (corner) | `grid h-7 w-7 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground` |
| Sidebar item | `flex w-full items-center gap-2.5 rounded-md px-2.5 py-2 text-xs text-muted-foreground transition-colors hover:bg-[var(--surface)] hover:text-foreground` |
| Sidebar action | `flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-xs font-medium text-foreground transition-colors hover:bg-[var(--surface-hover)]` |
| Download pill | `flex items-center gap-1.5 rounded-full border border-[var(--hairline)] px-3 py-1.5 text-[11px] tracking-wide text-muted-foreground transition-colors hover:bg-[var(--surface-hover)] hover:text-foreground disabled:opacity-50` |

### Text Labels
| Pattern | Classes |
|---------|---------|
| Section header | `serif-italic text-[10px] uppercase tracking-[0.3em] text-muted-foreground/70` |
| Tiny label | `text-[11px] text-muted-foreground/70` |
| Assistant byline | `serif-italic mb-1 text-[10px] uppercase tracking-[0.25em] text-muted-foreground/70` |
| Dialog title | `serif-italic text-lg font-normal` |

### Chat Messages
| Element | Classes |
|---------|---------|
| User bubble | `max-w-[80%] rounded-2xl rounded-br-md bg-[var(--surface-hover)] px-4 py-2.5 text-sm text-foreground` |
| Assistant container | `text-sm leading-relaxed text-foreground` |
| **bold in assistant | `<span class="text-[var(--warm)]">` |

### Input Area
| Element | Classes |
|---------|---------|
| Input container | `rounded-2xl border border-[var(--hairline)] bg-[var(--surface)]/80 backdrop-blur-md shadow-[0_8px_30px_-12px_rgba(0,0,0,0.6)]` |
| Textarea | `flex-1 resize-none bg-transparent px-1 py-2 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground/70 focus:outline-none` |

### Thinking Indicator
```tsx
<div className="serif-italic text-xs tracking-wide text-muted-foreground">
  composing
  <span className="ml-1 inline-flex gap-1">
    <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground" />
    <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:120ms]" />
    <span className="h-1 w-1 animate-pulse rounded-full bg-muted-foreground [animation-delay:240ms]" />
  </span>
</div>
```

### History List Item
| State | Classes |
|-------|---------|
| Base | `group relative flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-xs transition-colors` |
| Active | add `bg-[var(--surface-hover)] text-foreground` |
| Inactive | add `text-muted-foreground hover:bg-[var(--surface)] hover:text-foreground` |
| Actions | `flex items-center gap-0.5 opacity-0 transition-opacity group-hover:opacity-100` |

### Document Paper Sheet
```tsx
<div className="paper-noise relative flex-1 overflow-y-auto rounded-sm bg-[#FAFAF7] px-14 py-14 text-[#1a1a1a] shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7),0_8px_20px_rgba(0,0,0,0.4)]"
     style={{ fontFamily: '"Times New Roman", Times, serif' }}
/>
```

### Toggle Pill
```tsx
<div className="relative inline-flex items-center rounded-full border border-[var(--hairline)] bg-[var(--surface)]/60 p-1 backdrop-blur-sm">
  {/* button options with layoutId animated active pill */}
</div>
```

### Dialog Content
```tsx
<DialogContent className="bg-[var(--surface)] border-[var(--hairline)]">
  <DialogHeader>
    <DialogTitle className="serif-italic text-lg font-normal">Title</DialogTitle>
  </DialogHeader>
  {/* body */}
</DialogContent>
```

---

## Animation Configs

| Element | Spring/Duration | Config |
|---------|----------------|--------|
| ChatPanel layout morph | spring | stiffness: 180, damping: 26 |
| Messages appear | tween | 0.25s, fade + y: 6px |
| DocumentPane entry | spring | stiffness: 160, damping: 24, delay: 0.15s |
| ModelToggle active pill | spring | stiffness: 380, damping: 32 |
| Thinking dots | CSS pulse | 1s loop, staggered 120ms |

---

## Icon Conventions

- **Library:** Lucide React
- **Default strokeWidth:** `1.5`
- **Send ArrowUp:** `strokeWidth={2.2}`
- **Plus icon:** `strokeWidth={1.8}`

Common sizes: `h-3 w-3` (12px), `h-3.5 w-3.5` (14px), `h-4 w-4` (16px)

---

## Brand Mark

```
  ┌──────┐
  │  ◆   │  ← 10×10px diamond, rotated 45deg, warm (#F5F1E8) border
  └──────┘
  ZUNOORA  ← 14px/500/0.2em tracking
```

---

## Document Preview Prose Styles

Embed these in the paper sheet component:

```css
.prose-doc h1 { font-size: 28px; font-weight: 400; margin: 0 0 18px; letter-spacing: -0.01em; }
.prose-doc h2 { font-size: 17px; font-weight: 600; margin: 28px 0 10px; font-family: Inter, sans-serif; letter-spacing: 0.02em; text-transform: uppercase; color: #555; }
.prose-doc p  { font-size: 15px; line-height: 1.75; margin: 0 0 12px; }
.prose-doc ol { padding-left: 22px; margin: 0 0 14px; }
.prose-doc li { font-size: 15px; line-height: 1.7; margin-bottom: 4px; }
.prose-doc hr { border: 0; border-top: 1px solid #ddd; margin: 28px 0; }
.prose-doc em { font-style: italic; color: #555; }
.prose-doc strong { font-weight: 600; }
```

---

## State Machine

```
idle → (onSend) → generating → (document_ready) → ready → (onExpand/newChat) → idle
```

- **idle:** ChatPanel centered, no document
- **generating:** ChatPanel shrinks to corner (460×380 fixed), DocumentPane streams content
- **ready:** ChatPanel stays corner, DocumentPane complete with download button

---

*Full reference: `ZUNOORA-DESIGN-SPEC.md` in this directory*
