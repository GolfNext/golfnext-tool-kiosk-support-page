# HubSpot → ClickUp Customer Sync

Automatisk sync af kiosk kunder fra HubSpot til ClickUp.

## Setup

### 1. Find ClickUp Custom Field IDs

Kør dette script for at få field IDs:

```javascript
// get-clickup-field-ids.js
const CLICKUP_API_KEY = "your-key";
const LIST_ID = "901216139977";

fetch(`https://api.clickup.com/api/v2/list/${LIST_ID}`, {
  headers: { "Authorization": CLICKUP_API_KEY }
})
.then(r => r.json())
.then(data => {
  console.log("Custom Fields:");
  data.custom_fields.forEach(f => {
    console.log(`  ${f.name}: ${f.id}`);
  });
});
```

Output:
```
Custom Fields:
  HubSpot_ID: abc123...
  Latitude: def456...
  Longitude: ghi789...
  Country: jkl012...
  City: mno345...
```

### 2. Opdater Scripts med Field IDs

**I `hubspot-workflow-sync.js`:**

Erstat:
```javascript
{ id: "REPLACE_WITH_HUBSPOT_ID_FIELD_ID", value: companyId }
{ id: "REPLACE_WITH_LATITUDE_FIELD_ID", value: parseFloat(latitude) }
// etc...
```

Med de faktiske IDs fra step 1.

### 3. Environment Variables

```bash
# .env
HUBSPOT_API_KEY=your-hubspot-api-key
CLICKUP_API_KEY=pk_164509547_927YMWTX4LOVW82T1OQAFEWJO8XJ868C
CLICKUP_CLUBS_LIST_ID=901216139977
HUBSPOT_SEGMENT_ID=your-segment-id  # Optional
```

## Usage

### Bulk Sync (Én Gang)

```bash
npm install axios
node bulk-sync-customers.js
```

Dette syncer ALLE kunder fra dit HubSpot segment til ClickUp.

### HubSpot Workflow (Ongoing)

1. **Opret Workflow i HubSpot:**
   - Trigger: Company enrollment → [Dit kiosk kunder segment]
   - Action: Custom code action

2. **Paste `hubspot-workflow-sync.js` kode**

3. **Configure Input Properties:**
   ```
   - name (Company name)
   - latitude (Latitude)
   - longitude (Longitude)
   - country (Country)
   - city (City)
   - has_kiosk_subscription (Boolean property)
   ```

4. **Add Environment Variables** i HubSpot workflow settings

5. **Test workflow** med én testkunde først!

## Workflow Logic

**Når kunde ENTERS segment:**
- Har koordinater? → Create/Update i ClickUp ✓
- Mangler koordinater? → Skip (log warning)

**Når kunde LEAVES segment:**  
- Findes i ClickUp? → Delete task ✓
- Findes ikke? → Skip

## Required HubSpot Properties

- `name` (Company name)
- `Latitude` (Number)
- `Longitude` (Number)
- `Country` (Text)
- `City` (Text)
- `has_kiosk_subscription` (Boolean) ← Din trigger property

## ClickUp List Structure

**List:** GolfNext Kiosk Customers (ID: 901216139977)

**Custom Fields:**
- HubSpot_ID (Text)
- Latitude (Number)
- Longitude (Number)
- Country (Text)
- City (Text)

## Troubleshooting

**Problem:** "Missing custom field IDs"
- Run step 1 again to get correct IDs
- Replace placeholder IDs in code

**Problem:** "Coordinates not syncing"
- Check HubSpot properties exist and have values
- Check property names match exactly (case-sensitive)

**Problem:** "Tasks not deleting"
- Check has_kiosk_subscription property updates correctly
- Check workflow triggers on property change

## Next Steps

1. ✅ Run bulk sync to populate initial data
2. ✅ Setup HubSpot workflow for ongoing sync
3. ✅ Test with 1-2 customers first
4. ✅ Monitor logs for errors
5. ✅ Verify geo-filtering works on support page
