---
name: tailwind-css
description: Tailwind CSS v4 patterns and best practices. Use when writing styles, creating layouts, building responsive UI, or reviewing CSS/Tailwind classes. Triggers on any styling or design implementation work.
metadata:
  author: GolfNext
  version: "1.0.0"
---

# Tailwind CSS Best Practices

Apply these patterns when styling components with Tailwind CSS.

## Setup (Tailwind v4) — GolfNext Brand

Tailwind v4 uses CSS-first configuration. No `tailwind.config.js` needed.

The theme below uses GolfNext's brand palette adapted for a **work tool UI** — 
optimized for readability, screen contrast, and long-session comfort.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* ============================================
     GolfNext Brand Colors — Work Tool Adaptation
     ============================================ */

  /* Primary: Lime Brand #c0e66e — used for CTAs, active states, highlights
     Slightly darkened for better contrast on white backgrounds */
  --color-primary: #a8d44f;
  --color-primary-foreground: #1a2e05;
  --color-primary-light: #c0e66e;        /* Original brand lime — hover states, badges */
  --color-primary-lighter: #d3fa7d;      /* Lime Accent — subtle backgrounds, highlights */

  /* Secondary: Midnight Green #053e3f — headers, nav, dark UI elements */
  --color-secondary: #053e3f;
  --color-secondary-foreground: #ffffff;
  --color-secondary-light: #0a5c5e;      /* Hover state for secondary */

  /* Accent colors mapped to divisions */
  --color-accent-lime: #b0d169;          /* Lime Web — digital accent, links */
  --color-accent-clay: #ccb47f;          /* Clay — Kiosk division */
  --color-accent-orange: #f1a05a;        /* Orange — Voucher division */
  --color-accent-brown: #806f5e;         /* Brown — Simulator division */

  /* Semantic UI colors — optimized for work tool readability */
  --color-background: #ffffff;
  --color-foreground: #303333;           /* Base Dark — main text */
  --color-muted: #f5f5f0;               /* Warm neutral bg (softer than pure gray) */
  --color-muted-foreground: #555b5b;     /* Typography color — body text */
  --color-border: #e0ddd5;              /* Warm border (derived from Neutral #e9e1cf) */
  --color-border-strong: #c5c0b5;       /* Emphasized borders */

  /* Surface colors for cards, panels, sidebars */
  --color-surface: #ffffff;
  --color-surface-raised: #fafaf7;       /* Slightly warm white for raised cards */
  --color-surface-sunken: #f0efe9;       /* Inset panels, sidebar backgrounds */
  --color-surface-dark: #303333;         /* Dark panels (Base Dark) */
  --color-surface-dark-foreground: #e9e1cf; /* Text on dark surfaces (Neutral) */

  /* Feedback colors */
  --color-success: #5a9e3e;             /* Darker green for better contrast than brand lime */
  --color-success-light: #e8f5e0;
  --color-info: #60b2f0;                /* Info Blue */
  --color-info-light: #e0f0fd;
  --color-warning: #f1a05a;             /* Orange (brand) */
  --color-warning-light: #fef3e0;
  --color-destructive: #d9534f;          /* Slightly muted from #f07860 for pro look */
  --color-destructive-light: #fde8e5;
  --color-error: #f07860;               /* Brand error red — inline messages */

  /* Interactive states */
  --color-ring: #b0d169;                /* Focus ring — Lime Web */
  --color-ring-offset: #ffffff;

  /* Radius — slightly rounded, professional feel */
  --radius-sm: 0.25rem;
  --radius-md: 0.375rem;
  --radius-lg: 0.5rem;
  --radius-xl: 0.75rem;

  /* Fonts */
  --font-sans: 'Inter', system-ui, -apple-system, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', ui-monospace, monospace;
}

/* Dark mode overrides for dark panels/sections */
@media (prefers-color-scheme: dark) {
  :root {
    --color-background: #1a1d1d;
    --color-foreground: #e9e1cf;
    --color-muted: #252828;
    --color-muted-foreground: #a0a5a5;
    --color-border: #3a3d3d;
    --color-surface: #1a1d1d;
    --color-surface-raised: #222525;
    --color-surface-sunken: #141616;
  }
}
```

### GolfNext Logo Usage
Logo file: `logo-dark-green.png` (bundled in this skill)
- Use on light backgrounds with sufficient padding
- Minimum height: 32px in nav, 24px in compact UI
- On dark backgrounds (#303333), use the light/white variant

### Color Usage Guidelines for Work Tools

| Element | Color | Why |
|---------|-------|-----|
| Primary buttons, CTAs | `bg-primary` (#a8d44f) | Brand lime, darkened for WCAG AA contrast |
| Navigation bar | `bg-secondary` (#053e3f) | Midnight Green — anchors the UI |
| Body text | `text-foreground` (#303333) | Base Dark — easy on the eyes |
| Secondary text | `text-muted-foreground` (#555b5b) | Typography gray — sufficient contrast |
| Page background | `bg-background` (#fff) | Clean white |
| Card backgrounds | `bg-surface-raised` (#fafaf7) | Warm white — reduces eye strain |
| Sidebar | `bg-surface-sunken` (#f0efe9) | Subtle depth separation |
| Links | `text-accent-lime` (#b0d169) | Lime Web — digital-optimized |
| Success states | `text-success` (#5a9e3e) | Distinct from brand lime |
| Errors | `text-error` (#f07860) | Brand error red |
| Warnings | `text-warning` (#f1a05a) | Brand orange |
| Info | `text-info` (#60b2f0) | Brand info blue |

## Core Patterns

### Mobile-First Responsive
Always design mobile-first, then scale up.

```tsx
// ✅ Mobile-first
<div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

// ❌ Desktop-first
<div className="grid grid-cols-4 md:grid-cols-2 sm:grid-cols-1">
```

### Spacing Scale
Use consistent spacing from Tailwind's scale: 1, 2, 3, 4, 6, 8, 12, 16, 24.

```tsx
// ✅ Consistent spacing
<div className="p-4 space-y-6">        {/* page sections */}
<div className="p-6 space-y-4">        {/* card content */}
<div className="px-3 py-2 space-y-2">  {/* compact elements */}
```

### Common Layout Patterns

```tsx
// Centered page content
<main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

// Sticky header
<header className="sticky top-0 z-50 border-b bg-background/95 backdrop-blur">

// Card
<div className="rounded-lg border bg-card p-6 shadow-sm">

// Form group
<div className="space-y-2">
  <label className="text-sm font-medium">Label</label>
  <input className="w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
</div>

// Flex row with gap
<div className="flex items-center gap-3">

// Full-screen centered
<div className="flex min-h-screen items-center justify-center">
```

### Interactive States
Always include hover, focus, and disabled states.

```tsx
// Button
<button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground 
  hover:bg-primary/90 
  focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 
  disabled:opacity-50 disabled:cursor-not-allowed
  transition-colors">

// Card hover
<div className="rounded-lg border p-6 transition-shadow hover:shadow-md">

// Link
<a className="text-primary underline-offset-4 hover:underline">
```

### Dark Mode
Use `dark:` variants with CSS variables for automatic dark mode support.

```tsx
<div className="bg-background text-foreground dark:bg-gray-950 dark:text-gray-50">
```

## Component Recipes

### Navigation Bar
```tsx
<nav className="flex items-center justify-between bg-secondary px-6 py-4">
  <div className="flex items-center gap-8">
    <a href="/" className="flex items-center gap-2">
      <img src="/logo-light.png" alt="GolfNext" className="h-8" />
    </a>
    <div className="hidden sm:flex items-center gap-6">
      <a href="/workflows" className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Workflows</a>
      <a href="/products" className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Products</a>
      <a href="/settings" className="text-sm text-secondary-foreground/80 hover:text-secondary-foreground transition-colors">Settings</a>
    </div>
  </div>
  <button className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary-light transition-colors">
    New Workflow
  </button>
</nav>
```

### Hero Section
```tsx
<section className="bg-surface-sunken py-20 px-4 text-center">
  <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
    Main Headline
  </h1>
  <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
    Supporting description text.
  </p>
  <div className="mt-10 flex items-center justify-center gap-4">
    <button className="rounded-md bg-primary px-6 py-3 text-sm font-medium text-primary-foreground hover:bg-primary-light transition-colors">
      Primary CTA
    </button>
    <button className="rounded-md border border-border px-6 py-3 text-sm font-medium text-foreground hover:bg-muted transition-colors">
      Secondary CTA
    </button>
  </div>
</section>
```

### Work Tool Card
```tsx
<div className="rounded-lg border border-border bg-surface-raised p-6 hover:shadow-md transition-shadow">
  <div className="flex items-center gap-3 mb-4">
    <div className="h-10 w-10 rounded-md bg-primary-lighter flex items-center justify-center">
      <span className="text-secondary font-bold text-sm">AI</span>
    </div>
    <div>
      <h3 className="font-semibold text-foreground">Workflow Name</h3>
      <p className="text-xs text-muted-foreground">Last edited 2h ago</p>
    </div>
  </div>
  <p className="text-sm text-muted-foreground">Description of the workflow.</p>
  <div className="mt-4 flex items-center gap-2">
    <span className="rounded-full bg-success-light px-2 py-0.5 text-xs font-medium text-success">Active</span>
    <span className="rounded-full bg-info-light px-2 py-0.5 text-xs font-medium text-info">3 nodes</span>
  </div>
</div>
```

### Status Badges (Division Colors)
```tsx
{/* Use division accent colors for categorization */}
<span className="rounded-full bg-accent-clay/20 px-2 py-0.5 text-xs font-medium text-accent-clay">Kiosk</span>
<span className="rounded-full bg-accent-orange/20 px-2 py-0.5 text-xs font-medium text-accent-orange">Voucher</span>
<span className="rounded-full bg-accent-brown/20 px-2 py-0.5 text-xs font-medium text-accent-brown">Simulator</span>
```

## Rules

1. **Never use arbitrary values** when a Tailwind class exists (`p-[17px]` → `p-4`)
2. **Extract components** rather than repeating long class strings
3. **Use semantic color tokens** (bg-primary, text-foreground) not raw colors (bg-blue-500)
4. **Consistent border radius** — pick one (rounded-md or rounded-lg) and stick with it
5. **Always add transition** on interactive elements
