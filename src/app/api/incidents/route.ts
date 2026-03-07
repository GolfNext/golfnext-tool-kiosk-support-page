import { NextResponse } from "next/server";
import type { Incident, GolfClub, IncidentScope } from "@/types";
import { filterClubsByProximity } from "@/lib/geo";
import { headers } from "next/headers";

const PROXIMITY_RADIUS_KM = 10;

// Scope ID to label mapping
const SCOPE_MAP: Record<string, IncidentScope> = {
  "0": "Global",
  "1": "Country",
  "2": "Clubs",
  "Global": "Global",
  "Country": "Country",
  "Clubs": "Clubs",
};

export async function GET(request: Request) {
  try {
    const apiKey = process.env.CLICKUP_API_KEY;
    const incidentsListId = process.env.CLICKUP_INCIDENTS_LIST_ID;
    const clubsListId = process.env.CLICKUP_CLUBS_LIST_ID;

    if (!apiKey || !incidentsListId) {
      return NextResponse.json({ incidents: [] });
    }

    const headersList = await headers();
    const userLat = headersList.get("x-vercel-ip-latitude");
    const userLon = headersList.get("x-vercel-ip-longitude");
    const userCountry = headersList.get("x-vercel-ip-country");

    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "en").toLowerCase();

    // Fetch incidents with relationships included
    const incidentsUrl = `https://api.clickup.com/api/v2/list/${incidentsListId}/task?statuses[]=OPEN&statuses[]=MONITORING&include_closed=false`;
    
    const incidentsResponse = await fetch(incidentsUrl, {
      headers: { Authorization: apiKey },
      next: { revalidate: 60 },
    });

    if (!incidentsResponse.ok) {
      return NextResponse.json({ incidents: [] });
    }

    const incidentsData = await incidentsResponse.json();
    
    // Fetch all clubs if list ID configured
    const clubsMap = new Map<string, GolfClub>();
    
    if (clubsListId && clubsListId !== "your-clubs-list-id-here") {
      const clubsResponse = await fetch(
        `https://api.clickup.com/api/v2/list/${clubsListId}/task`,
        {
          headers: { Authorization: apiKey },
          next: { revalidate: 3600 },
        }
      );

      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        
        (clubsData.tasks || []).forEach((clubTask: any) => {
          const lat = clubTask.custom_fields?.find((f: any) => f.name === "Latitude")?.value;
          const lon = clubTask.custom_fields?.find((f: any) => f.name === "Longitude")?.value;
          
          if (lat && lon) {
            clubsMap.set(clubTask.id, {
              id: clubTask.id,
              name: clubTask.name,
              hubspotId: clubTask.custom_fields?.find((f: any) => f.name === "HubSpot_ID")?.value || "",
              latitude: parseFloat(lat),
              longitude: parseFloat(lon),
              country: clubTask.custom_fields?.find((f: any) => f.name === "Country")?.value || "",
              countryCode: clubTask.custom_fields?.find((f: any) => f.name === "Country_Code")?.value || "",
              city: clubTask.custom_fields?.find((f: any) => f.name === "City")?.value || "",
            });
          }
        });
      }
    }

    // Calculate nearby clubs
    let nearbyClubIds = new Set<string>();
    if (userLat && userLon && clubsMap.size > 0) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);
      const allClubs = Array.from(clubsMap.values());
      const nearbyClubs = filterClubsByProximity(allClubs, lat, lon, PROXIMITY_RADIUS_KM);
      nearbyClubIds = new Set(nearbyClubs.map((c) => c.clubId));
    }

    // Process incidents
    let incidents: Incident[] = (incidentsData.tasks || []).map((task: any) => {
      // Get scope - map ID to label
      const scopeField = task.custom_fields?.find((f: any) => f.name === "Incident_Scope");
      const scopeRaw = scopeField?.value || "2"; // Default to Clubs
      const scope: IncidentScope = SCOPE_MAP[String(scopeRaw)] || "Clubs";

      // Get target country
      const targetCountryField = task.custom_fields?.find((f: any) => f.name === "Target_Country");
      let targetCountry = targetCountryField?.value;
      
      // Map country ID to label if needed
      if (targetCountryField?.type_config?.options && targetCountry) {
        const option = targetCountryField.type_config.options.find(
          (opt: any) => opt.id === targetCountry || opt.orderindex === targetCountry
        );
        targetCountry = option?.label || option?.name || targetCountry;
      }

      // Get locale-specific title
      const titleFieldName = `Title_${locale.toUpperCase()}`;
      const titleField = task.custom_fields?.find((f: any) => f.name === titleFieldName);
      const localizedTitle = titleField?.value || task.name;

      // Get venues - try both relationship and custom field
      let venues: string[] = [];
      let clubs: GolfClub[] = [];

      // Try relationship field first (preferred)
      const venueRelationships = task.relationships?.venue || [];
      if (venueRelationships.length > 0) {
        const venueIds = venueRelationships.map((rel: any) => rel.id || rel);
        clubs = venueIds
          .map((id: string) => clubsMap.get(id))
          .filter((club): club is GolfClub => club !== undefined);
        venues = clubs.map((c) => c.name);
      } 
      // Fallback to custom field venue
      else {
        const venueField = task.custom_fields?.find((f: any) => f.name === "Venue");
        if (venueField?.type_config?.options) {
          const selectedValues = Array.isArray(venueField.value) 
            ? venueField.value 
            : venueField.value ? [venueField.value] : [];

          venues = selectedValues
            .map((valueId: any) => {
              const option = venueField.type_config.options.find(
                (opt: any) => opt.id === valueId || opt.orderindex === valueId
              );
              return option?.label || option?.name || null;
            })
            .filter(Boolean);
        }
      }

      return {
        id: task.id,
        title: localizedTitle,
        description: task.description || "",
        status: task.status?.status?.toUpperCase() || "OPEN",
        scope,
        targetCountry,
        clubs,
        venues,
        updatedAt: task.date_created
          ? new Date(parseInt(task.date_created)).toISOString()
          : undefined,
      };
    });

    // Apply scope filtering
    if (clubsMap.size > 0) {
      incidents = incidents.filter((incident) => {
        if (incident.scope === "Global") return true;
        
        if (incident.scope === "Country" && userCountry) {
          const countryCodeMap: Record<string, string> = {
            "Denmark": "DK", "Iceland": "IS", "Sweden": "SE",
            "Finland": "FI", "Norway": "NO",
          };
          return userCountry === countryCodeMap[incident.targetCountry || ""];
        }

        if (incident.scope === "Clubs") {
          if (!userLat || !userLon || nearbyClubIds.size === 0) return true;
          return incident.clubs?.some((club) => nearbyClubIds.has(club.id)) || venues.length > 0;
        }

        return true;
      });
    }

    console.log("INCIDENTS DATA:", JSON.stringify(incidents.map(i => ({ id: i.id, scope: i.scope, venues: i.venues })), null, 2));
    console.log(`Returning ${incidents.length} incidents`);
    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ incidents: [] });
  }
}
