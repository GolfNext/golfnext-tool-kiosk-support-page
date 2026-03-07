/**
 * Bulk Sync: HubSpot Companies → ClickUp GolfNext Kiosk Customers
 * Run once to sync all existing customers
 * 
 * Usage: node bulk-sync-customers.js
 */

const HUBSPOT_API_KEY = process.env.HUBSPOT_API_KEY;
const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
const CLICKUP_CLUBS_LIST_ID = process.env.CLICKUP_CLUBS_LIST_ID;
const HUBSPOT_SEGMENT_ID = process.env.HUBSPOT_SEGMENT_ID; // Optional: filter by segment

async function fetchHubSpotCompanies() {
  console.log("Fetching companies from HubSpot...");
  
  const url = HUBSPOT_SEGMENT_ID
    ? `https://api.hubapi.com/crm/v3/objects/companies/search`
    : `https://api.hubapi.com/crm/v3/objects/companies?properties=Latitude,Longitude,Country,City&limit=100`;
  
  const response = await fetch(url, {
    method: HUBSPOT_SEGMENT_ID ? "POST" : "GET",
    headers: {
      "Authorization": `Bearer ${HUBSPOT_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: HUBSPOT_SEGMENT_ID ? JSON.stringify({
      filterGroups: [{
        filters: [{
          propertyName: "hs_segment_membership",
          operator: "EQ",
          value: HUBSPOT_SEGMENT_ID
        }]
      }],
      properties: ["Latitude", "Longitude", "Country", "City"],
      limit: 100
    }) : undefined
  });

  if (!response.ok) {
    throw new Error(`HubSpot API error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.results || [];
}

async function getExistingClickUpTasks() {
  console.log("Fetching existing ClickUp tasks...");
  
  const response = await fetch(
    `https://api.clickup.com/api/v2/list/${CLICKUP_CLUBS_LIST_ID}/task`,
    {
      headers: { "Authorization": CLICKUP_API_KEY }
    }
  );

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  // Build map of HubSpot ID → ClickUp task ID
  const existingMap = new Map();
  for (const task of data.tasks || []) {
    const hubspotIdField = task.custom_fields?.find(f => f.name === "HubSpot_ID");
    if (hubspotIdField?.value) {
      existingMap.set(hubspotIdField.value, task.id);
    }
  }
  
  return existingMap;
}

async function createOrUpdateClickUpTask(company, existingTaskId = null) {
  const lat = company.properties.latitude;
  const lon = company.properties.longitude;
  
  // Skip if no coordinates
  if (!lat || !lon) {
    console.log(`  Skipping ${company.properties.name}: Missing coordinates`);
    return;
  }

  const taskData = {
    name: company.properties.name,
    custom_fields: [
      { id: "hubspot_id_field_id", value: company.id },
      { id: "latitude_field_id", value: parseFloat(lat) },
      { id: "longitude_field_id", value: parseFloat(lon) },
      { id: "country_field_id", value: company.properties.country || "" },
      { id: "city_field_id", value: company.properties.city || "" },
    ]
  };

  if (existingTaskId) {
    // Update existing task
    const response = await fetch(
      `https://api.clickup.com/api/v2/task/${existingTaskId}`,
      {
        method: "PUT",
        headers: {
          "Authorization": CLICKUP_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      }
    );
    
    if (response.ok) {
      console.log(`  ✓ Updated: ${company.properties.name}`);
    } else {
      console.error(`  ✗ Failed to update ${company.properties.name}:`, response.statusText);
    }
  } else {
    // Create new task
    const response = await fetch(
      `https://api.clickup.com/api/v2/list/${CLICKUP_CLUBS_LIST_ID}/task`,
      {
        method: "POST",
        headers: {
          "Authorization": CLICKUP_API_KEY,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(taskData)
      }
    );
    
    if (response.ok) {
      console.log(`  ✓ Created: ${company.properties.name}`);
    } else {
      console.error(`  ✗ Failed to create ${company.properties.name}:`, response.statusText);
    }
  }
}

async function main() {
  console.log("=== HubSpot → ClickUp Bulk Sync ===\n");
  
  // Fetch data
  const companies = await fetchHubSpotCompanies();
  const existingTasks = await getExistingClickUpTasks();
  
  console.log(`\nFound ${companies.length} companies in HubSpot`);
  console.log(`Found ${existingTasks.size} existing tasks in ClickUp\n`);
  
  // Sync each company
  for (const company of companies) {
    const existingTaskId = existingTasks.get(company.id);
    await createOrUpdateClickUpTask(company, existingTaskId);
  }
  
  console.log("\n✓ Sync complete!");
}

main().catch(console.error);
