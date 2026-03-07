/**
 * Helper script to get ClickUp custom field IDs
 * Run this first to get the IDs you need for the sync scripts
 */

const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY || "pk_164509547_927YMWTX4LOVW82T1OQAFEWJO8XJ868C";
const LIST_ID = process.env.CLICKUP_CLUBS_LIST_ID || "901216139977";

async function getFieldIds() {
  console.log(`Fetching custom fields for list ${LIST_ID}...\n`);
  
  const response = await fetch(
    `https://api.clickup.com/api/v2/list/${LIST_ID}`,
    {
      headers: { "Authorization": CLICKUP_API_KEY }
    }
  );

  if (!response.ok) {
    throw new Error(`ClickUp API error: ${response.statusText}`);
  }

  const data = await response.json();
  
  console.log("=== ClickUp Custom Field IDs ===\n");
  console.log("Copy these IDs into your sync scripts:\n");
  
  data.custom_fields.forEach(field => {
    console.log(`${field.name}:`);
    console.log(`  ID: "${field.id}"`);
    console.log(`  Type: ${field.type}\n`);
  });
  
  console.log("\nReplace in code:");
  console.log('{ id: "REPLACE_WITH_HUBSPOT_ID_FIELD_ID", value: ... }');
  console.log('       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^');
  console.log(`       Use: "${data.custom_fields.find(f => f.name === "HubSpot_ID")?.id}"`);
}

getFieldIds().catch(console.error);
