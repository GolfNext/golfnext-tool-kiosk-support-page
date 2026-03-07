/**
 * HubSpot Custom Workflow Code Action
 * Syncs company to ClickUp when added to kiosk customers segment
 * 
 * Use in HubSpot Workflow:
 * Trigger: Company enters/leaves kiosk customers segment
 * Action: Custom code action with this code
 */

const axios = require('axios');

exports.main = async (event, callback) => {
  const CLICKUP_API_KEY = process.env.CLICKUP_API_KEY;
  const CLICKUP_CLUBS_LIST_ID = process.env.CLICKUP_CLUBS_LIST_ID;
  
  // Input properties from workflow
  const companyId = event.object.objectId;
  const companyName = event.inputFields.name;
  const latitude = event.inputFields.latitude;
  const longitude = event.inputFields.longitude;
  const country = event.inputFields.country;
  const city = event.inputFields.city;
  const isActive = event.inputFields.has_kiosk_subscription; // Boolean property
  
  console.log(`Processing: ${companyName} (${companyId}), Active: ${isActive}`);
  
  try {
    // Check if task already exists in ClickUp
    const existingTask = await findClickUpTaskByHubSpotId(companyId, CLICKUP_API_KEY, CLICKUP_CLUBS_LIST_ID);
    
    if (isActive && latitude && longitude) {
      // Customer is active and has coordinates → Create or Update
      
      if (existingTask) {
        // Update existing task
        await axios.put(
          `https://api.clickup.com/api/v2/task/${existingTask.id}`,
          {
            name: companyName,
            custom_fields: [
              { id: existingTask.customFieldIds.latitude, value: parseFloat(latitude) },
              { id: existingTask.customFieldIds.longitude, value: parseFloat(longitude) },
              { id: existingTask.customFieldIds.country, value: country || "" },
              { id: existingTask.customFieldIds.city, value: city || "" },
            ]
          },
          {
            headers: { "Authorization": CLICKUP_API_KEY }
          }
        );
        
        console.log(`✓ Updated ClickUp task for ${companyName}`);
        callback({ outputFields: { status: "updated", taskId: existingTask.id } });
      } else {
        // Create new task
        const response = await axios.post(
          `https://api.clickup.com/api/v2/list/${CLICKUP_CLUBS_LIST_ID}/task`,
          {
            name: companyName,
            custom_fields: [
              { id: "REPLACE_WITH_HUBSPOT_ID_FIELD_ID", value: companyId },
              { id: "REPLACE_WITH_LATITUDE_FIELD_ID", value: parseFloat(latitude) },
              { id: "REPLACE_WITH_LONGITUDE_FIELD_ID", value: parseFloat(longitude) },
              { id: "REPLACE_WITH_COUNTRY_FIELD_ID", value: country || "" },
              { id: "REPLACE_WITH_CITY_FIELD_ID", value: city || "" },
            ]
          },
          {
            headers: { "Authorization": CLICKUP_API_KEY }
          }
        );
        
        console.log(`✓ Created ClickUp task for ${companyName}`);
        callback({ outputFields: { status: "created", taskId: response.data.id } });
      }
    } 
    else if (!isActive && existingTask) {
      // Customer became inactive → Delete from ClickUp
      await axios.delete(
        `https://api.clickup.com/api/v2/task/${existingTask.id}`,
        {
          headers: { "Authorization": CLICKUP_API_KEY }
        }
      );
      
      console.log(`✓ Deleted ClickUp task for ${companyName}`);
      callback({ outputFields: { status: "deleted" } });
    }
    else {
      console.log(`No action needed for ${companyName}`);
      callback({ outputFields: { status: "skipped" } });
    }
    
  } catch (error) {
    console.error("Error:", error.message);
    callback({ outputFields: { status: "error", error: error.message } });
  }
};

async function findClickUpTaskByHubSpotId(hubspotId, apiKey, listId) {
  const response = await axios.get(
    `https://api.clickup.com/api/v2/list/${listId}/task`,
    {
      headers: { "Authorization": apiKey }
    }
  );
  
  const tasks = response.data.tasks || [];
  
  for (const task of tasks) {
    const hubspotIdField = task.custom_fields?.find(f => f.name === "HubSpot_ID");
    if (hubspotIdField?.value === hubspotId) {
      // Extract custom field IDs for updates
      return {
        id: task.id,
        customFieldIds: {
          latitude: task.custom_fields.find(f => f.name === "Latitude")?.id,
          longitude: task.custom_fields.find(f => f.name === "Longitude")?.id,
          country: task.custom_fields.find(f => f.name === "Country")?.id,
          city: task.custom_fields.find(f => f.name === "City")?.id,
        }
      };
    }
  }
  
  return null;
}
