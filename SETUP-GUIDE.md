# GolfNext Kiosk Hotline - Complete Setup Guide

## ClickUp Structure

### List 1: "GolfNext Clubs" (Master Data)

**Purpose:** Master database of all golf clubs with coordinates

**Task Name:** Club name (e.g., "Horsens Golfklub")

**Custom Fields (exact naming for code):**

| Field Name | Type | Example | Synced from HubSpot |
|------------|------|---------|-------------------|
| `HubSpot_ID` | Text | "12345678" | Company ID |
| `Latitude` | Number | 55.8304 | GPS latitude |
| `Longitude` | Number | 9.8469 | GPS longitude |
| `Country` | Text | "Denmark" | Full country name |
| `Country_Code` | Text | "DK" | ISO code |
| `City` | Text | "Horsens" | City name |

**Note:** This list is auto-populated via HubSpot automation (companies with active kiosk subscriptions)

---

### List 2: "Driftsforstyrrelser" (Incidents)

**Purpose:** Track active kiosk issues

**Custom Fields:**

#### Scope & Targeting

| Field Name | Type | Options | When to Use |
|------------|------|---------|-------------|
| `Incident_Scope` | Dropdown | "Global", "Country", "Clubs" | Always required |
| `Target_Country` | Dropdown | "Denmark", "Iceland", "Sweden", "Finland", "Norway" | Only if Scope = Country |
| `Venue` | Relationship | → GolfNext Clubs (multi-select) | Only if Scope = Clubs |

#### Status & Titles

| Field Name | Type | Options/Example |
|------------|------|-----------------|
| Status | Dropdown | "OPEN", "MONITORING" |
| `Title_DA` | Text | "Printeren virker ikke" |
| `Title_SV` | Text | "Skrivaren fungerar inte" |
| `Title_IS` | Text | "Prentarinn virkar ekki" |
| `Title_FI` | Text | "Tulostin ei toimi" |
| `Title_EN` | Text | "Printer not working" |
| `Title_NO` | Text | "Skriveren virker ikke" |
| `Title_DE` | Text | "Drucker funktioniert nicht" |

---

## Incident Scope Examples

### Global Incident
```
Scope: Global
Target_Country: (leave empty)
Venue: (leave empty)

Example: "Payment system down across all kiosks"
Badge: 🌍 All kiosks
Shown to: Everyone, everywhere
```

### Country Incident
```
Scope: Country
Target_Country: Denmark
Venue: (leave empty)

Example: "MobilePay connection unstable in Denmark"
Badge: 🇩🇰 Denmark
Shown to: Only users in Denmark
```

### Club-Specific Incident
```
Scope: Clubs
Target_Country: (leave empty)
Venue: [Select Horsens Golf, Silkeborg Golf]

Example: "Printer unavailable at Horsens"
Badge: 📍 Horsens Golf
Shown to: Only users within 10km of selected clubs
```

---

## HubSpot → ClickUp Automation

**Trigger:** Company created/updated
**Filter:** has_active_kiosk_subscription = true

**Actions:**
1. Create/update task in "GolfNext Clubs" list
2. Map fields:
   - Task Name ← company_name
   - HubSpot_ID ← company_id
   - Latitude ← club_latitude
   - Longitude ← club_longitude
   - Country ← country
   - Country_Code ← country_code
   - City ← city

---

## Environment Variables

**For Vercel:**
```env
NEXT_PUBLIC_LOKALISE_PROJECT_ID=6764581769aad86b2910c1.52650415
LOKALISE_API_TOKEN=6e39f2bfe0778c8a16d06d318e37c155bfcb2bd6
CLICKUP_API_KEY=pk_164509547_927YMWTX4LOVW82T1OQAFEWJO8XJ868C
CLICKUP_INCIDENTS_LIST_ID=901216137151
CLICKUP_CLUBS_LIST_ID=[get after creating "GolfNext Clubs" list]
```

---

## Geo-Filtering Logic

**Automatic location detection via Vercel Pro:**
- x-vercel-ip-latitude (approximate, city-level)
- x-vercel-ip-longitude
- x-vercel-ip-country

**Filtering rules:**
1. **Global scope:** Always visible
2. **Country scope:** Only if user country matches
3. **Clubs scope:** Only if user within 10km of affected club

**Fallback:** If no geo data available, shows all relevant incidents

**Accuracy:** ~1-10km precision (sufficient for golf club separation)

---

## Workflow Example

**Creating an incident:**

1. New task in "Driftsforstyrrelser"
2. Set **Incident_Scope**:
   - Global? → Leave other fields empty
   - Country? → Select Target_Country
   - Clubs? → Select clubs in Venue relationship
3. Set **Status**: OPEN or MONITORING
4. Fill **Title_XX** for each language (use ClickUp Brain to translate)
5. Add **Description**
6. Save → Appears instantly on support page!

**User experience:**

1. Player in Iceland scans QR code
2. Page detects location (Iceland)
3. Shows:
   - ✅ Global incidents (all users see these)
   - ✅ Iceland country incidents  
   - ✅ Incidents from nearby Icelandic clubs
   - ❌ Danish/Swedish club incidents (filtered out)

---

## Requirements

- ✅ Vercel Pro plan (for geo headers)
- ✅ ClickUp native HubSpot integration
- ✅ HubSpot companies with GPS coordinates
- ✅ Lokalise project with all translation keys
