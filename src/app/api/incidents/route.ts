import { NextResponse } from "next/server";
import type { Incident, GolfClub } from "@/types";
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

    // Get user's approximate location from Vercel geo (Pro plan)
    const headersList = await headers();
    const userLat = headersList.get("x-vercel-ip-latitude");
    const userLon = headersList.get("x-vercel-ip-longitude");
    const userCountry = headersList.get("x-vercel-ip-country");

    console.log("User location (Vercel):", { userLat, userLon, userCountry });

    // Get locale from query param
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "en").toLowerCase();

    // Fetch incidents with OPEN or MONITORING status
    const incidentsUrl = `https://api.clickup.com/api/v2/list/${incidentsListId}/task?statuses[]=OPEN&statuses[]=MONITORING`;
    
    const incidentsResponse = await fetch(incidentsUrl, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 60 },
    });

    if (!incidentsResponse.ok) {
      console.error("ClickUp incidents error:", incidentsResponse.status);
      return NextResponse.json({ incidents: [] });
    }

    const incidentsData = await incidentsResponse.json();

    // Fetch all clubs from GolfNext Clubs list
    const clubsUrl = `https://api.clickup.com/api/v2/list/${clubsListId}/task`;
    
    const clubsResponse = await fetch(clubsUrl, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      next: { revalidate: 3600 }, // Cache clubs for 1 hour
    });

    const clubsData = await clubsResponse.json();
    
    // Parse clubs into lookup map
    const clubsMap = new Map<string, GolfClub>();
    (clubsData.tasks || []).forEach((clubTask: any) => {
      const lat = clubTask.custom_fields?.find((f: any) => f.name === "Latitude")?.value;
      const lon = clubTask.custom_fields?.find((f: any) => f.name === "Longitude")?.value;
      const country = clubTask.custom_fields?.find((f: any) => f.name === "Country")?.value;
      const countryCode = clubTask.custom_fields?.find((f: any) => f.name === "Country_Code")?.value;
      const city = clubTask.custom_fields?.find((f: any) => f.name === "City")?.value;
      const hubspotId = clubTask.custom_fields?.find((f: any) => f.name === "HubSpot_ID")?.value;

      if (lat && lon) {
        clubsMap.set(clubTask.id, {
          id: clubTask.id,
          name: clubTask.name,
          hubspotId: hubspotId || "",
          latitude: parseFloat(lat),
          longitude: parseFloat(lon),
          country: country || "",
          countryCode: countryCode || "",
          city: city || "",
        });
      }
    });

    // Process incidents
    let incidents: Incident[] = (incidentsData.tasks || []).map((task: any) => {
      // Get locale-specific title
      const titleFieldName = `Title_${locale.toUpperCase()}`;
      const titleField = task.custom_fields?.find(
        (field: any) => field.name === titleFieldName
      );
      const localizedTitle = titleField?.value || task.name;

      // Get venue relationships (array of linked task IDs)
      const venueRelationships = task.relationships?.find(
        (rel: any) => rel.name === "Venue"
      );
      
      const venueIds: string[] = venueRelationships?.task_ids || [];
      
      // Lookup full club data
      const clubs: GolfClub[] = venueIds
        .map((id) => clubsMap.get(id))
        .filter((club): club is GolfClub => club !== undefined);

      return {
        id: task.id,
        title: localizedTitle,
        description: task.description || "",
        status: task.status?.status?.toUpperCase() || "OPEN",
        venueIds,
        clubs,
        venues: clubs.map((c) => c.name),
        updatedAt: task.date_created
          ? new Date(parseInt(task.date_created)).toISOString()
          : undefined,
      };
    });

    // Apply geo-filtering if user location available
    if (userLat && userLon && clubsMap.size > 0) {
      const lat = parseFloat(userLat);
      const lon = parseFloat(userLon);
      
      // Get all unique clubs from all incidents
      const allClubs = Array.from(clubsMap.values());
      
      // Find clubs within radius
      const nearbyClubs = filterClubsByProximity(allClubs, lat, lon, PROXIMITY_RADIUS_KM);
      const nearbyClubIds = new Set(nearbyClubs.map((c) => c.clubId));

      console.log(`User at (${lat}, ${lon}), found ${nearbyClubs.length} clubs within ${PROXIMITY_RADIUS_KM}km`);

      // Filter incidents to only show those affecting nearby clubs
      incidents = incidents.filter((incident) =>
        incident.clubs?.some((club) => nearbyClubIds.has(club.id))
      );

      console.log(`Filtered to ${incidents.length} incidents for nearby clubs`);
    }

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    return NextResponse.json({ incidents: [] });
  }
}
