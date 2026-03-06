# GolfNext Kiosk Remote Help – Project Specification

**Version:** 2.0  
**Author:** Peter Selmer, Founder & CPO  
**Date:** March 2026  
**Status:** Ready for development

---

## Overview

A mobile-optimised support hotline page, accessed via QR code on GolfNext machines (kiosks, driving range payment terminals, simulators). The page helps players get support quickly, troubleshoot themselves, and understand what GolfNext vs. the club is responsible for.

**URL:** `https://golfnext.com/kiosk-remotehelp`  
**Repo:** `golfnext-kiosk-remotehelp` (GitHub)  
**Hosting:** Vercel (automatic deploy from GitHub `main`)  
**Support phone:** +45 70 70 79 99

---

## Tech Stack

Follows the [GolfNext Internal Tools Standard](link-to-internal-tools-doc), with the exception that this is a customer-facing page (not an internal tool) and therefore uses a minimal Next.js setup without Supabase.

| Layer | Technology |
|-------|-----------|
| Language | TypeScript |
| Framework | Next.js (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Translations | Lokalise OTA (Over-the-Air) |
| Incident status | ClickUp API (via Next.js API route) |
| Hosting | Vercel |
| Source control | GitHub |

---

## Repo Structure

```
golfnext-kiosk-remotehelp/
├── src/
│   ├── app/
│   │   ├── page.tsx              # Main hotline page
│   │   └── api/
│   │       └── incidents/
│   │           └── route.ts      # Server-side ClickUp proxy
│   ├── components/
│   │   ├── LanguageSwitcher.tsx  # Flag dropdown
│   │   ├── StatusBadge.tsx       # Open/closed indicator
│   │   ├── IncidentList.tsx      # Active driftsforstyrrelser
│   │   ├── SelfHelp.tsx          # FAQ accordion
│   │   └── ClubContact.tsx       # Hvad GolfNext ikke kan hjælpe med
│   ├── lib/
│   │   ├── lokalise.ts           # Lokalise OTA client
│   │   ├── time.ts               # CET/CEST open/closed logic
│   │   └── locale.ts             # Language detection + localStorage
│   └── types/
│       └── index.ts              # TypeScript types
├── CLAUDE.md                     # AI coding guidelines
├── README.md
├── .env.example
├── package.json
├── tailwind.config.ts
└── tsconfig.json
```

---

## Environment Variables

```bash
LOKALISE_PROJECT_ID=xxx
LOKALISE_OTA_BUNDLE_ID=xxx
CLICKUP_API_KEY=xxx
CLICKUP_LIST_ID=xxx
```

Configure in Vercel Dashboard → Project → Settings → Environment Variables.

`.env.example` must be kept up to date in the repo.

---

## Brand & Design

### Colors (Tailwind CSS variables)

```css
--color-bg:            #053E3F;   /* Midnight Green – page background */
--color-accent:        #C0E66E;   /* Lime – primary CTA, logo */
--color-accent-bright: #D3FA7D;   /* Lime Accent – hover states */
--color-neutral:       #E9E1CF;   /* Neutral – muted text, dividers */
--color-text:          #FFFFFF;   /* White – body text */
--color-text-muted:    rgba(255,255,255,0.6);
--color-card-bg:       rgba(255,255,255,0.06);
--color-error:         #F07860;   /* Error Red – closed badge */
--color-success:       #C0E66E;   /* Lime – open badge */
```

### Typography

| Element | Font | Weight |
|---------|------|--------|
| Headlines | Sora | SemiBold |
| Body | Manrope | Light / Regular |
| CTAs | Sora | SemiBold |

Load via Google Fonts in `layout.tsx`.

### Logo

Lime (`#C0E66E`) logo on Midnight Green background.

Available logo files (use SVG for web):
- `Horizontal Logo Lime.svg` – use in header (primary)
- `Logo Icon Lime.svg` – use in footer (small)
- `Vertical Logo Lime.svg` – available if needed

Logo files are in the GolfNext brand asset library:
```
Google Drive > Shared drives > GolfNext > 03 - Marketing > 
Material > New logo & Design and brand manual > GolfNext Logo > Logo Final
```

Copy `Horizontal Logo Lime.svg` to `public/logo.svg` in the repo.

### Layout

- **Mobile-only:** Optimised for 375px–430px viewport
- No desktop layout required (QR scan = always mobile)
- Max-width: `480px`, centered
- Generous spacing, minimum tap target height: `48px`
- Dark Midnight Green background throughout

---

## Language System

### Detection priority

```typescript
// src/lib/locale.ts

const SUPPORTED_LOCALES = ['da', 'sv', 'is', 'fi', 'en'] as const;
type Locale = typeof SUPPORTED_LOCALES[number];

function detectLocale(): Locale {
  // 1. Check localStorage (user has manually selected before)
  const saved = localStorage.getItem('golfnext-locale') as Locale;
  if (saved && SUPPORTED_LOCALES.includes(saved)) return saved;

  // 2. Browser/phone language
  const browser = navigator.language.slice(0, 2).toLowerCase() as Locale;
  if (SUPPORTED_LOCALES.includes(browser)) return browser;

  // 3. Fallback
  return 'en';
}
```

### Adding new languages

**Zero code changes required.** To add a new language (e.g. Norwegian):
1. Add `'no'` to `SUPPORTED_LOCALES` array (one line change)
2. Add Norwegian to Lokalise project and translate all keys
3. Publish bundle in Lokalise
4. The page automatically serves Norwegian to Norwegian users

The list of available locales can optionally be fetched dynamically from Lokalise, making even the one-line code change unnecessary.

---

## Language Switcher Component

A compact dropdown in the page header, top-right position.

**Default state:** Shows flag + name of current language  
```
🇩🇰 Dansk ▾
```

**Expanded state:** Shows all available languages  
```
🇩🇰 Dansk
🇸🇪 Svenska
🇮🇸 Íslenska
🇫🇮 Suomi
🇬🇧 English
```

**Behaviour:**
- Tapping saves selection to `localStorage`
- Page re-renders with new locale (no full reload)
- Uses shadcn/ui `DropdownMenu` component

**Scaling:** When new languages are added in Lokalise, they appear in the dropdown automatically if the locale list is fetched dynamically.

---

## Lokalise OTA Integration

```typescript
// src/lib/lokalise.ts

async function loadTranslations(locale: Locale): Promise<Translations> {
  const url = `https://ota.lokalise.com/v3/lokalise/projects/${process.env.NEXT_PUBLIC_LOKALISE_PROJECT_ID}/bundles/${process.env.NEXT_PUBLIC_LOKALISE_OTA_BUNDLE_ID}/${locale}.json`;
  const response = await fetch(url);
  return response.json();
}
```

All UI text elements use `data-i18n` attributes or a `t('key')` helper function.

---

## Lokalise Keys (Full List)

All content on the page is managed via Lokalise. No hardcoded user-facing strings in the codebase.

```
# General
hotline.page_title
hotline.tagline

# Language switcher
lang.da
lang.sv
lang.is
lang.fi
lang.en

# Status badge
hotline.status.open
hotline.status.closed
hotline.status.opens_at

# Phone
hotline.phone.label
hotline.phone.call_button

# Email
hotline.email.label

# Active incidents
hotline.incidents.title
hotline.incidents.none
hotline.incidents.updated_at

# Self-help (dynamic – controlled via Lokalise)
selfhelp.title
selfhelp.items.count          ← integer, e.g. "5"
selfhelp.item.1.title
selfhelp.item.1.step.count    ← integer, e.g. "3"
selfhelp.item.1.step.1
selfhelp.item.1.step.2
selfhelp.item.1.step.3
selfhelp.item.2.title
selfhelp.item.2.step.count
selfhelp.item.2.step.1
...                           ← repeat pattern for each item

# What GolfNext cannot help with – contact the club
club.section.title            ← "Hvad GolfNext ikke kan hjælpe med – kontakt klubben"
club.section.description
club.items.count              ← integer, e.g. "5"
club.item.1
club.item.2
club.item.3
club.item.4
club.item.5
club.find_club                ← "Find din klub på..."

# About
about.link_label
```

### Dynamic FAQ logic

The page reads `selfhelp.items.count` and `club.items.count` from Lokalise and builds the UI dynamically. To add a new FAQ item or club contact item:

1. Increment the `.count` key in Lokalise
2. Add the new `.title`, `.step.count`, and `.step.N` keys
3. Translate to all active languages
4. Publish – changes are live immediately, no code deploy needed

**Initial self-help items (DA):**

| # | Title |
|---|-------|
| 1 | Printeren printer ikke |
| 2 | Kortet virker ikke |
| 3 | Automaten reagerer ikke / frosset skærm |
| 4 | Jeg fik ikke min kvittering |
| 5 | Automaten er slukket |

**Initial club contact items (DA):**

| # | Item |
|---|------|
| 1 | Åbningstider og greenfee-priser |
| 2 | Medlemskab og kontingent |
| 3 | Booking af starttider |
| 4 | Nøgle/adgang til anlægget |
| 5 | Generelle spørgsmål om klubben |

---

## Page Sections

### 1. Header
- GolfNext logo in Lime (see logo note above) — left aligned
- Language switcher dropdown — right aligned
- Background: Midnight Green

### 2. Status Badge – Hotline Open/Closed

Detect current time in **CET/CEST** (handle DST automatically via `Intl.DateTimeFormat`).

```typescript
// src/lib/time.ts
function isHotlineOpen(): boolean {
  const now = new Date();
  const cetHour = parseInt(
    new Intl.DateTimeFormat('en', {
      timeZone: 'Europe/Copenhagen',
      hour: 'numeric',
      hour12: false
    }).format(now)
  );
  return cetHour >= 7 && cetHour < 22;
}
```

| State | Time (CET) | Badge | Call button |
|-------|-----------|-------|-------------|
| Open | 07:00–22:00 | 🟢 Lime badge | Active |
| Closed | 22:00–07:00 | 🔴 Red badge + "Åbner kl. 07:00 CET" | Visible but disabled |

Phone number is always visible regardless of state.

### 3. Phone Number (Primary CTA)
- Large, prominent `<a href="tel:+4570707999">` button
- **Number:** +45 70 70 79 99
- Styled: Lime background (`#C0E66E`), Midnight Green text, Sora SemiBold
- Minimum height: 56px
- Disabled state (when closed): muted styling, not tappable

### 4. Email (Secondary)
- `support@golfnext.com`
- `<a href="mailto:support@golfnext.com">`
- Shown below phone, smaller visual weight
- Always visible (useful when hotline is closed)

### 5. Active Incidents (Driftsforstyrrelser)
- Fetched from `/api/incidents` (server-side ClickUp proxy)
- Only tasks with ClickUp status **"Open"** are shown
- Resolving a task in ClickUp → disappears from page automatically
- If no active incidents → section is hidden entirely
- Each incident: task name (bold) + task description (body text)
- Refresh: on page load only (v1)

**ClickUp list setup:**
- List name: "🔴 Driftsforstyrrelser"
- Task title = venue + problem (e.g. "Horsens Golf – Automat #2 nede")
- Task description = status message shown to players
- Close/resolve task = removes from page

### 6. Self-Help / Selvhjælp
- Accordion (shadcn/ui `Accordion` component)
- Collapsed by default
- Each item: icon + title → expands to numbered steps
- All content from Lokalise (fully dynamic, see above)

### 7. Hvad GolfNext ikke kan hjælpe med – kontakt klubben
- Visually distinct section (lighter card background, different heading style)
- Bullet list of club-responsibility items (dynamic from Lokalise)
- Footer note: "Find din klub på..." with link
- All content from Lokalise (fully dynamic, see above)

### 8. Footer
- GolfNext logo (small, Lime or White)
- "Om GolfNext" link → `https://www.golfnext.com/about`
- Copyright: © GolfNext

---

## API Route: ClickUp Proxy

**File:** `src/app/api/incidents/route.ts`

Server-side only. API key never exposed to browser.

```typescript
export async function GET() {
  const response = await fetch(
    `https://api.clickup.com/api/v2/list/${process.env.CLICKUP_LIST_ID}/task?statuses[]=open`,
    {
      headers: { Authorization: process.env.CLICKUP_API_KEY! },
      next: { revalidate: 60 } // Cache for 60 seconds
    }
  );

  const data = await response.json();

  const incidents = data.tasks.map((task: any) => ({
    id: task.id as string,
    title: task.name as string,
    description: (task.description || '') as string
  }));

  return Response.json({ incidents });
}
```

---

## CLAUDE.md

```markdown
# GolfNext Kiosk Remote Help – AI Coding Guidelines

This is a customer-facing Next.js page following the GolfNext Internal Tools Standard.

## Rules

- TypeScript only. No `any` types except in ClickUp API response mapping.
- All variable names, function names, and code comments in English.
- Tailwind CSS + shadcn/ui only. No other styling approaches.
- All user-facing strings must use the Lokalise translation system (t() helper). No hardcoded text.
- ClickUp API calls must go through the server-side API route (/api/incidents). Never call ClickUp directly from the browser.
- Time zone logic must use Intl.DateTimeFormat with Europe/Copenhagen. Never use manual UTC offset.
- Mobile-first. Max-width 480px. Minimum tap target 48px.

## Brand

- Background: #053E3F (Midnight Green)
- Accent: #C0E66E (Lime)
- Fonts: Sora (headlines/CTAs), Manrope (body)

## Stack

- Next.js App Router
- Tailwind CSS
- shadcn/ui components
- Lokalise OTA for translations
- ClickUp API for incident status
- Vercel deployment
```

---

## Setup Checklist

### Design
- [ ] Copy `Horizontal Logo Lime.svg` from brand library to `public/logo.svg` in repo
- [ ] Copy `Logo Icon Lime.svg` from brand library to `public/logo-icon.svg` in repo

### Lokalise
- [ ] Create project: "GolfNext Kiosk Remote Help"
- [ ] Enable Over-the-Air (OTA) delivery, note Bundle ID
- [ ] Add all keys from the key list above
- [ ] Translate to DA, SV, IS, FI, EN
- [ ] Add `NEXT_PUBLIC_LOKALISE_PROJECT_ID` and `NEXT_PUBLIC_LOKALISE_OTA_BUNDLE_ID` to `.env`

### ClickUp
- [ ] Create list: "🔴 Driftsforstyrrelser"
- [ ] Note List ID from URL
- [ ] Generate API token in ClickUp Settings → Apps
- [ ] Add `CLICKUP_API_KEY` and `CLICKUP_LIST_ID` to `.env`

### Vercel
- [ ] Create project, connect GitHub repo
- [ ] Add all environment variables in Vercel Dashboard
- [ ] Configure custom path: `golfnext.com/kiosk-remotehelp`
- [ ] Test on real mobile device

### QR Code
- [ ] Update QR code sticker URL to `https://golfnext.com/kiosk-remotehelp`
- [ ] Test QR scan → page load on iOS and Android

---

## v1 Scope

- [x] All 8 page sections
- [x] Language detection + Lokalise OTA
- [x] Language switcher dropdown with flags
- [x] CET open/closed logic with DST support
- [x] ClickUp API proxy + dynamic incident display
- [x] Dynamic FAQ via Lokalise (no code deploy for content changes)
- [x] GolfNext brand design (Midnight Green + Lime)
- [x] Mobile-only layout
- [x] TypeScript + Next.js + Tailwind + shadcn/ui

## v2 Ideas

- Venue-specific view via URL parameter: `?venue=horsens-golf`
- Callback request form (name + number → creates ClickUp task)
- Analytics via HubSpot tracking code
- Push notifications when incidents are resolved
- Norsk, Tysk og andre sprog tilføjes via Lokalise (ingen kodeændring)
