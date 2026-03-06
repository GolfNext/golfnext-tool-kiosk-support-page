import { NextResponse } from "next/server";
import { loadTranslations } from "@/lib/lokalise";
import { isSupportedLocale } from "@/lib/locale-types";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const locale = searchParams.get("locale") || "en";

  if (!isSupportedLocale(locale)) {
    return NextResponse.json(
      { error: "Unsupported locale" },
      { status: 400 }
    );
  }

  try {
    const translations = await loadTranslations(locale);

    return NextResponse.json(
      { translations },
      {
        headers: {
          "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("Failed to load translations:", error);
    return NextResponse.json(
      { error: "Failed to load translations", translations: {} },
      { status: 500 }
    );
  }
}
