import { NextResponse } from "next/server";
import type { Incident } from "@/types";

export async function GET(request: Request) {
  try {
    const apiKey = process.env.CLICKUP_API_KEY;
    const listId = process.env.CLICKUP_LIST_ID;

    if (!apiKey || !listId) {
      return NextResponse.json({ incidents: [] });
    }

    // Get locale from query param (optional)
    const { searchParams } = new URL(request.url);
    const locale = (searchParams.get("locale") || "en").toLowerCase();

    const url = `https://api.clickup.com/api/v2/list/${listId}/task?statuses[]=OPEN&statuses[]=MONITORING`;
    
    const response = await fetch(url, {
      headers: {
        Authorization: apiKey,
        "Content-Type": "application/json",
      },
      next: {
        revalidate: 60,
      },
    });

    if (!response.ok) {
      console.error("ClickUp API error:", response.status);
      return NextResponse.json({ incidents: [] });
    }

    const data = await response.json();

    const incidents: Incident[] = (data.tasks || []).map((task: any) => {
      // Find locale-specific title (e.g., "Title DA", "Title EN")
      const titleFieldName = `Title ${locale.toUpperCase()}`;
      const titleField = task.custom_fields?.find(
        (field: any) => field.name === titleFieldName
      );
      
      // Use locale-specific title if available, fallback to task name
      const localizedTitle = titleField?.value || task.name;

      // Find the Venue custom field
      const venueField = task.custom_fields?.find(
        (field: any) => field.name === "Venue"
      );
      
      let venues: string[] = [];
      
      if (venueField && venueField.type_config?.options) {
        const selectedValues = Array.isArray(venueField.value) 
          ? venueField.value 
          : venueField.value 
            ? [venueField.value] 
            : [];

        venues = selectedValues
          .map((valueId: any) => {
            const option = venueField.type_config.options.find(
              (opt: any) => opt.id === valueId || opt.orderindex === valueId
            );
            return option?.label || option?.name || null;
          })
          .filter(Boolean);
      }
      
      return {
        id: task.id as string,
        title: localizedTitle as string,
        description: (task.description || "") as string,
        status: task.status?.status?.toUpperCase() || "OPEN",
        venues: venues,
        updatedAt: task.date_created
          ? new Date(parseInt(task.date_created)).toISOString()
          : undefined,
      };
    });

    return NextResponse.json({ incidents });
  } catch (error) {
    console.error("Failed to fetch incidents:", error);
    return NextResponse.json({ incidents: [] });
  }
}
