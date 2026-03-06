import { NextResponse } from "next/server";
import type { Incident, GolfClub, IncidentScope } from "@/types";
import { filterClubsByProximity } from "@/lib/geo";
import { headers } from "next/headers";

const PROXIMITY_RADIUS_KM = 10;

export async function GET(request: Request) {
  try {
    const apiKey = process.env.CLICKUP_API_KEY;
    const incidentsListId = process.env.CLICKUP_INCIDENTS_LIST_ID;
    const clubsListId = process.env.CLICKUP_CLUBS_LIST_ID;

    if (!apiKey || !incidentsListId || !clubsListId) {
      console.error("ClickUp credentials missing");
      return NextResponse.json({ incidents: [] });
    }

    // Get user's location from Vercel geo headers (Pro plan)
    const headersList = await headers();
    const userLat = headersList.get("x-vercel-ip-latitude");
    const userLon = headersList.get("x-vercel-ip-longitude");
    const userCountry = headersList.get("x-vercel-ip-country");

    console.log("User geo:", { userLat, userLon, userCountry });

    // Get locale from query param
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "en").toLowerCase();

    // Fetch incidents
    const incidentsUrl = `https://api.clickup.com/api/v2/list/${incidentsListId}/task?statuses[]=OPEN&statuses[]=MONITORING`;
    
    const incidentsResponse = await fetch(incidentsUrl, {
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      next: { revalidate: 60 },
    });

    if (!incidentsResponse.ok) {
      console.error("ClickUp incidents error:", incidentsResponse.status);
      return NextResponse.json({ incidents: [] });
    }

    // Fetch all clubs
    const clubsUrl = `https://api.clickup.com/api/v2/list/${clubsListId}/task`;
    
    const clubsResponse = await fetch(clubsUrl, {
      headers: { Authorization: apiKey, "Content-Type": "application/json" },
      next: { revalidate: 3600 }, // Cache 1 hour
    });

    if (!clubsResponse.ok) {
      console.error("ClickUp clubs error:", clubsResponse.status);
    }

    const incidentsData = await incidentsResponse.json();
    const clubsData = await clubsResponse.json();
    
    // Build clubs lookup map
    const clubsMap = new Map<string, GolfClub>();
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

    // Determine nearby clubs if user location available
    let nearbyClubIds = new Set<string>();
    if (userLat && userLon) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);
      const allClubs = Array.from(clubsMap.values());
      const nearbyClubs = filterClubsByProximity(allClubs, lat, lon, PROXIMITY_RADIUS_KM);
      nearbyClubIds = new Set(nearbyClubs.map((c) => c.clubId));
      console.log(`Found ${nearbyClubs.length} clubs within ${PROXIMITY_RADIUS_KM}km`);
    }

    // Process incidents
    let incidents: Incident[] = (incidentsData.tasks || []).map((task: any) => {
      // Get scope
      const scopeField = task.custom_fields?.find((f: any) => f.name === "Incident_Scope");
      const scope: IncidentScope = scopeField?.value || "Clubs";

      // Get target country (for Country scope)
      const targetCountryField = task.custom_fields?.find((f: any) => f.name === "Target_Country");
      const targetCountry = targetCountryField?.value;

      // Get locale-specific title
      const titleFieldName = `Title_${locale.toUpperCase()}`;
      const titleField = task.custom_fields?.find((f: any) => f.name === titleFieldName);
      const localizedTitle = titleField?.value || task.name;

      // Get venue relationships
      const venueRelationships = task.relationships?.find((rel: any) => rel.name === "Venue");
      const venueIds: string[] = venueRelationships?.task_ids || [];
      
      // Lookup clubs
      const clubs: GolfClub[] = venueIds
        .map((id) => clubsMap.get(id))
        .filter((club): club is GolfClub => club !== undefined);

      return {
        id: task.id,
        title: localizedTitle,
        description: task.description || "",
        status: task.status?.status?.toUpperCase() || "OPEN",
        scope,
        targetCountry,
        venueIds,
        clubs,
        venues: clubs.map((c) => c.name),
        updatedAt: task.date_created
          ? new Date(parseInt(task.date_created)).toISOString()
          : undefined,
      };
    });

    // Apply scope-based filtering
    incidents = incidents.filter((incident) => {
      // Global incidents: always show
      if (incident.scope === "Global") {
        return true;
      }

      // Country incidents: show if user in same country
      if (incident.scope === "Country") {
        // Map country names to codes
        const countryCodeMap: Record<string, string> = {
          "Denmark": "DK",
          "Iceland": "IS",
          "Sweden": "SE",
          "Finland": "FI",
          "Norway": "NO",
        };
        const targetCode = countryCodeMap[incident.targetCountry || ""];
        return userCountry === targetCode;
      }

      // Club-specific incidents: show if user near any affected club
      if (incident.scope === "Clubs") {
        // If no geo data, show all club incidents (fallback)
        if (!userLat || !userLon || nearbyClubIds.size === 0) {
          return true;
        }
        // Show if any affected club is nearby
        return incident.clubs?.some((club) => nearbyClubIds.has(club.id)) || false;
      }

      return true; // Fallback: show if scope unknown
    });

    console.log(`Returning ${incidents.length} filtered incidents`);

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    return NextResponse.json({ incidents: [] });
  }
}
