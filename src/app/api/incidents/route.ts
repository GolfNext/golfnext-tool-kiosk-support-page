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

const COUNTRY_ID_MAP: Record<string, string> = {
  "0": "Denmark",
  "1": "Iceland",
  "2": "Sweden",
  "3": "Finland",
  "4": "Norway",
};

const COUNTRY_CODE_MAP: Record<string, string> = {
  "Denmark": "DK",
  "Iceland": "IS",
  "Sweden": "SE",
  "Finland": "FI",
  "Norway": "NO",
};

export async function GET(request: Request) {
  try {
    const apiKey = process.env.CLICKUP_API_KEY;
    const incidentsListId = process.env.CLICKUP_INCIDENTS_LIST_ID || process.env.CLICKUP_LIST_ID;
    const clubsListId = process.env.CLICKUP_CLUBS_LIST_ID;

    if (!apiKey || !incidentsListId) {
      console.log("Missing API key or incidents list ID");
      return NextResponse.json({ incidents: [] });
    }

    // Get user location from headers
    const headersList = await headers();
    const userLat = headersList.get("x-vercel-ip-latitude");
    const userLon = headersList.get("x-vercel-ip-longitude");
    const userCountry = headersList.get("x-vercel-ip-country");
    const userCity = headersList.get("x-vercel-ip-city");

    console.log("=== USER LOCATION ===");
    console.log(`Position: ${userLat}, ${userLon} | ${userCity}, ${userCountry}`);

    // Get locale from query params
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "en").toLowerCase();

    // Fetch incidents from ClickUp
    console.log("=== FETCHING INCIDENTS ===");
    const incidentsResponse = await fetch(
      `https://api.clickup.com/api/v2/list/${incidentsListId}/task?statuses[]=OPEN&statuses[]=MONITORING`,
      {
        headers: { Authorization: apiKey },
        next: { revalidate: 10 },
      }
    );

    if (!incidentsResponse.ok) {
      console.error("Failed to fetch incidents:", incidentsResponse.status);
      return NextResponse.json({ incidents: [] });
    }

    const incidentsData = await incidentsResponse.json();
    console.log(`Fetched ${incidentsData.tasks?.length || 0} incidents from ClickUp`);
    
    // Fetch clubs individually to get full custom field data
    const clubsMap = new Map<string, GolfClub>();
    
    if (clubsListId && clubsListId !== "your-clubs-list-id-here") {
      console.log("=== FETCHING CLUBS ===");
      console.log("Clubs list ID:", clubsListId);
      
      // First get list of club task IDs
      const clubsListResponse = await fetch(
        `https://api.clickup.com/api/v2/list/${clubsListId}/task`,
        {
          headers: { Authorization: apiKey },
          next: { revalidate: 600 },
        }
      );

      if (clubsListResponse.ok) {
        const clubsListData = await clubsListResponse.json();
        const clubCount = clubsListData.tasks?.length || 0;
        console.log(`Found ${clubCount} club tasks`);
        
        // Fetch each club individually to get full custom field data
        for (const clubTaskSummary of clubsListData.tasks || []) {
          try {
            const clubDetailResponse = await fetch(
              `https://api.clickup.com/api/v2/task/${clubTaskSummary.id}`,
              {
                headers: { Authorization: apiKey },
                next: { revalidate: 600 },
              }
            );
            
            if (clubDetailResponse.ok) {
              const clubTask = await clubDetailResponse.json();
              
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
                
                // Calculate distance if user location available
                if (userLat && userLon) {
                  const distance = calculateDistance(
                    parseFloat(userLat),
                    parseFloat(userLon),
                    club.latitude,
                    club.longitude
                  );
                  console.log(`  ${club.name} (${club.city}): ${distance.toFixed(2)}km away`);
                }
              } else {
                console.log(`  ${clubTask.name}: Missing coordinates`);
              }
            }
          } catch (error) {
            console.error(`Failed to fetch club ${clubTaskSummary.id}:`, error);
          }
        }
        
        console.log(`Loaded ${clubsMap.size} clubs with coordinates`);
      } else {
        console.error("Failed to fetch clubs list:", clubsListResponse.status);
      }
    } else {
      console.log("Clubs list ID not configured, skipping geo-filtering");
    }

    // Calculate nearby clubs for geo-filtering
    let nearbyClubIds = new Set<string>();
    if (userLat && userLon && clubsMap.size > 0) {
      console.log("=== GEO-FILTERING ===");
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);
      const allClubs = Array.from(clubsMap.values());
      const nearbyClubs = filterClubsByProximity(allClubs, lat, lon, PROXIMITY_RADIUS_KM);
      nearbyClubIds = new Set(nearbyClubs.map((c) => c.clubId));
      console.log(`Clubs within ${PROXIMITY_RADIUS_KM}km: ${nearbyClubs.map(c => `${c.name} (${c.distance.toFixed(1)}km)`).join(", ") || "none"}`);
    }

    // Process and transform incidents
    console.log("=== PROCESSING INCIDENTS ===");
    const incidents: Incident[] = (incidentsData.tasks || []).map((task: any) => {
      // Get scope from Incident_Scope field (0=Global, 1=Country, 2=Clubs)
      const scopeField = task.custom_fields?.find((f: any) => f.name === "Incident_Scope");
      const scopeRaw = scopeField?.value;
      const scope: IncidentScope = (scopeRaw !== undefined && scopeRaw !== null)
        ? (SCOPE_MAP[String(scopeRaw)] || "Clubs")
        : "Clubs";

      // Get target country from Target_Country field (0=Denmark, 1=Iceland, etc.)
      const targetCountryField = task.custom_fields?.find((f: any) => f.name === "Target_Country");
      let targetCountry = targetCountryField?.value;
      
      // Map country ID to label using type_config first, then fallback to manual map
      if (targetCountryField?.type_config?.options && targetCountry !== null && targetCountry !== undefined) {
        const option = targetCountryField.type_config.options.find(
          (opt: any) => String(opt.id) === String(targetCountry) || opt.orderindex === targetCountry
        );
        targetCountry = option?.label || option?.name || COUNTRY_ID_MAP[String(targetCountry)] || targetCountry;
      } else if (targetCountry !== null && targetCountry !== undefined) {
        targetCountry = COUNTRY_ID_MAP[String(targetCountry)] || String(targetCountry);
      }

      // Get locale-specific title
      const titleFieldName = `Title_${locale.toUpperCase()}`;
      const titleField = task.custom_fields?.find((f: any) => f.name === titleFieldName);
      const localizedTitle = titleField?.value || task.name;

      // Get venues from Venue/s relationship field
      const venueField = task.custom_fields?.find((f: any) => f.name === "Venue/s");
      
      let venues: string[] = [];
      let clubs: GolfClub[] = [];

      if (venueField && venueField.type === "list_relationship" && Array.isArray(venueField.value)) {
        // Extract venue names
        venues = venueField.value
          .map((item: any) => item.name)
          .filter((name: string | null | undefined): name is string => Boolean(name));
        
        // Extract venue task IDs and map to club details
        const venueTaskIds = venueField.value
          .map((item: any) => item.id)
          .filter(Boolean);
        
        clubs = venueTaskIds
          .map((id: string) => clubsMap.get(id))
          .filter((club: GolfClub | undefined): club is GolfClub => club !== undefined);
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

    console.log(`Processed ${incidents.length} incidents`);

    // Apply scope-based filtering
    console.log("=== FILTERING INCIDENTS ===");
    const filteredIncidents = incidents.filter((incident) => {
      // Global scope: always show to everyone
      if (incident.scope === "Global") {
        console.log(`  ✓ ${incident.title}: Global scope - showing to all users`);
        return true;
      }

      // Country scope: show only if user in same country
      if (incident.scope === "Country") {
        const targetCode = COUNTRY_CODE_MAP[incident.targetCountry || ""];
        const matches = userCountry === targetCode;
        console.log(`  ${matches ? "✓" : "✗"} ${incident.title}: Country=${incident.targetCountry} (${targetCode}), User=${userCountry}, Match=${matches}`);
        return matches;
      }

      // Clubs scope: show if user near any affected club
      if (incident.scope === "Clubs") {
        // If no clubs data or no geo, show all (fallback)
        if (clubsMap.size === 0 || !userLat || !userLon) {
          console.log(`  ✓ ${incident.title}: Clubs scope, no geo-filtering available (fallback: show all)`);
          return true;
        }
        
        // Check if any affected club is nearby
        const hasNearbyClub = incident.clubs?.some((club) => nearbyClubIds.has(club.id)) || false;
        console.log(`  ${hasNearbyClub ? "✓" : "✗"} ${incident.title}: Clubs=${incident.venues?.join(", ")}, Nearby=${hasNearbyClub}`);
        return hasNearbyClub;
      }

      // Default: show incident
      return true;
    });

    console.log(`=== RESULT ===`);
    console.log(`Filtered: ${incidents.length} → ${filteredIncidents.length} incidents`);
    
    return NextResponse.json({ incidents: filteredIncidents });
    
  } catch (error) {
    console.error("=== API ERROR ===");
    console.error(error);
    return NextResponse.json({ incidents: [] });
  }
}
