# GolfNext Kiosk Hotline - Setup Guide

## ClickUp Lists Setup

### 1. Create "GolfNext Clubs" List

**Custom Fields:**
- `HubSpot_ID` (Text) - HubSpot Company ID
- `Latitude` (Number) - GPS coordinate
- `Longitude` (Number) - GPS coordinate
- `Country` (Text) - Full country name
- `Country_Code` (Text) - ISO code (DK, IS, SE, etc.)
- `City` (Text) - City name

**Task Name:** Club name (synced from HubSpot)

### 2. Setup "Driftsforstyrrelser" List

**Custom Fields:**
- `Venue` (Relationship → "GolfNext Clubs" list, Multi-select)
- `Status` (Dropdown: OPEN, MONITORING)
- `Title_DA` (Text) - Danish title
- `Title_SV` (Text) - Swedish title
- `Title_IS` (Text) - Icelandic title  
- `Title_FI` (Text) - Finnish title
- `Title_EN` (Text) - English title
- `Title_NO` (Text) - Norwegian title
- `Title_DE` (Text) - German title

## HubSpot → ClickUp Automation

**Trigger:** Company created/updated with kiosk subscription

**Action:** Create/update task in "GolfNext Clubs" list

**Field Mapping:**
- Task Name ← Company Name
- HubSpot_ID ← Company ID
- Latitude ← club_latitude property
- Longitude ← club_longitude property
- Country ← country property
- Country_Code ← country_code property
- City ← city property

## Environment Variables (Vercel)

```
NEXT_PUBLIC_LOKALISE_PROJECT_ID=6764581769aad86b2910c1.52650415
LOKALISE_API_TOKEN=6e39f2bfe0778c8a16d06d318e37c155bfcb2bd6
CLICKUP_API_KEY=pk_164509547_927YMWTX4LOVW82T1OQAFEWJO8XJ868C
CLICKUP_INCIDENTS_LIST_ID=901216137151
CLICKUP_CLUBS_LIST_ID=[get from ClickUp after creating list]
```

## How Geo-Filtering Works

1. User visits page from their location
2. Vercel captures approximate GPS (city-level precision)
3. App fetches all incidents and clubs from ClickUp
4. Calculates distance to each club
5. Shows only incidents for clubs within 10km radius
6. Fallback: If no geo data, shows all incidents

**Accuracy:** ~1-10km precision (sufficient for most golf clubs)

## Creating an Incident

1. Create task in "Driftsforstyrrelser" list
2. Set Status: OPEN or MONITORING
3. Select affected clubs in Venue field (relationship)
4. Fill Title_XX fields for each supported language
5. Add description
6. Incident appears on support page automatically!

## Notes

- Vercel Pro plan required for geo headers (x-vercel-ip-latitude/longitude)
- ClickUp native HubSpot integration keeps clubs list synced
- Support page caches club data for 1 hour
- Incidents cached for 60 seconds
