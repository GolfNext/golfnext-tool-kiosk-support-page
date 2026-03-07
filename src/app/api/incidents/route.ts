import { NextResponse } from "next/server";
import type { Incident, GolfClub, IncidentScope } from "@/types";
import { filterClubsByProximity } from "@/lib/geo";
import { headers } from "next/headers";

const PROXIMITY_RADIUS_KM = 10;

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

    // Fetch incidents
    const incidentsResponse = await fetch(
      `https://api.clickup.com/api/v2/list/${incidentsListId}/task?statuses[]=OPEN&statuses[]=MONITORING`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 60 },
      }
    );

    if (!incidentsResponse.ok) {
      return NextResponse.json({ incidents: [] });
    }

    const incidentsData = await incidentsResponse.json();
    
    // Fetch clubs if configured
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
    const incidents: Incident[] = (incidentsData.tasks || []).map((task: any) => {
      // Get scope
      const scopeField = task.custom_fields?.find((f: any) => f.name === "Incident_Scope");
      const scopeRaw = scopeField?.value || "2";
      const scope: IncidentScope = SCOPE_MAP[String(scopeRaw)] || "Clubs";

      // Get target country
      const targetCountryField = task.custom_fields?.find((f: any) => f.name === "Target_Country");
      let targetCountry = targetCountryField?.value;
      
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

      // Get venues from "Venue/s" relationship field
      const venueField = task.custom_fields?.find((f: any) => f.name === "Venue/s");
      
      let venues: string[] = [];
      let clubs: GolfClub[] = [];

      if (venueField && venueField.type === "list_relationship" && Array.isArray(venueField.value)) {
        // Extract club IDs and names from relationship field value
        const venueTaskIds = venueField.value.map((item: any) => item.id).filter(Boolean);
        venues = venueField.value.map((item: any) => item.name).filter(Boolean);
        
        // Lookup full club data with coordinates
        clubs = venueTaskIds
          .map((id: string) => clubsMap.get(id))
          .filter((club): club is GolfClub => club !== undefined);
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

    console.log(`Returning ${incidents.length} incidents`);
    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ incidents: [] });
  }
}
