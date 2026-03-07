import { NextResponse } from "next/server";
import type { Incident, GolfClub, IncidentScope } from "@/types";
import { filterClubsByProximity, calculateDistance } from "@/lib/geo";
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
    const incidentsListId = process.env.CLICKUP_INCIDENTS_LIST_ID || process.env.CLICKUP_LIST_ID;
    const clubsListId = process.env.CLICKUP_CLUBS_LIST_ID;

    if (!apiKey || !incidentsListId) {
      console.error("Missing API key or incidents list ID");
      return NextResponse.json({ incidents: [] });
    }

    const headersList = await headers();
    const userLat = headersList.get("x-vercel-ip-latitude");
    const userLon = headersList.get("x-vercel-ip-longitude");
    const userCountry = headersList.get("x-vercel-ip-country");
    const userCity = headersList.get("x-vercel-ip-city");

    console.log("=== USER LOCATION ===");
    console.log("Latitude:", userLat, "Longitude:", userLon);
    console.log("Country:", userCountry, "City:", userCity);

    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "en").toLowerCase();

    // Fetch incidents (reduced cache)
    const incidentsResponse = await fetch(
      `https://api.clickup.com/api/v2/list/${incidentsListId}/task?statuses[]=OPEN&statuses[]=MONITORING`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 10 }, // Cache only 10 seconds
      }
    );

    if (!incidentsResponse.ok) {
      console.error("ClickUp incidents API error");
      return NextResponse.json({ incidents: [] });
    }

    const incidentsData = await incidentsResponse.json();
    console.log(`Fetched ${incidentsData.tasks?.length || 0} incidents from ClickUp`);
    
    // Fetch clubs
    const clubsMap = new Map<string, GolfClub>();
    
    if (clubsListId && clubsListId !== "your-clubs-list-id-here") {
      console.log("Fetching clubs from list ID:", clubsListId);
      const clubsResponse = await fetch(
        `https://api.clickup.com/api/v2/list/${clubsListId}/task`,
        {
          headers: { Authorization: apiKey },
          next: { revalidate: 600 }, // Cache clubs for 10 minutes
        }
      );

      if (clubsResponse.ok) {
        const clubsData = await clubsResponse.json();
        
        (clubsData.tasks || []).forEach((clubTask: any) => {
          const lat = clubTask.custom_fields?.find((f: any) => f.name === "Latitude")?.value;
          const lon = clubTask.custom_fields?.find((f: any) => f.name === "Longitude")?.value;
          
          if (lat && lon) {
            const club: GolfClub = {
              id: clubTask.id,
              name: clubTask.name,
              hubspotId: clubTask.custom_fields?.find((f: any) => f.name === "HubSpot_ID")?.value || "",
              latitude: parseFloat(lat),
              longitude: parseFloat(lon),
              country: clubTask.custom_fields?.find((f: any) => f.name === "Country")?.value || "",
              countryCode: clubTask.custom_fields?.find((f: any) => f.name === "Country_Code")?.value || "",
              city: clubTask.custom_fields?.find((f: any) => f.name === "City")?.value || "",
            };
            clubsMap.set(clubTask.id, club);
            
            // Log distance to user if geo available
            if (userLat && userLon) {
              const distance = calculateDistance(
                parseFloat(userLat),
                parseFloat(userLon),
                club.latitude,
                club.longitude
              );
              console.log(`Club: ${club.name} (${club.city}) - Distance: ${distance.toFixed(2)}km`);
            }
          }
        });
        
        console.log(`Loaded ${clubsMap.size} clubs with coordinates`);
      } else {
        console.error("Failed to fetch clubs, status:", clubsResponse.status, clubsResponse.statusText);
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
      console.log(`User within ${PROXIMITY_RADIUS_KM}km of: ${nearbyClubs.map(c => c.name).join(", ")}`);
    }

    // Process incidents
    const incidents: Incident[] = (incidentsData.tasks || []).map((task: any) => {
      // Get scope
      const scopeField = task.custom_fields?.find((f: any) => f.name === "Incident_Scope");
      const scopeRaw = scopeField?.value;
      const scope: IncidentScope = (scopeRaw !== undefined && scopeRaw !== null) ? (SCOPE_MAP[String(scopeRaw)] || "Clubs") : "Clubs";

      console.log(`Task "${task.name}": Scope raw=${scopeRaw}, mapped=${scope}`);

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
        // Extract ALL venues from relationship
        venues = venueField.value
          .map((item: any) => item.name)
          .filter((name: string | null | undefined): name is string => Boolean(name));
        
        const venueTaskIds = venueField.value
          .map((item: any) => item.id)
          .filter(Boolean);
        
        clubs = venueTaskIds
          .map((id: string) => clubsMap.get(id))
          .filter((club: GolfClub | undefined): club is GolfClub => club !== undefined);
          
        console.log(`  Venues: ${venues.join(", ")} (${venues.length} total)`);
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

    console.log(`\nReturning ${incidents.length} incidents`);
    console.log("Incidents:", incidents.map(i => ({ title: i.title, scope: i.scope, venues: i.venues })));
    
    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("API Error:", error);
    return NextResponse.json({ incidents: [], error: String(error) });
  }
}
