import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/location/cities?name=...&stateId=...
 * Search cities by name (optionally filter by state)
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = getSupabaseServerClient(request, response);

  try {
    const searchParams = request.nextUrl.searchParams;
    const name = searchParams.get("name");
    const stateIdParam = searchParams.get("stateId");

    if (!name) {
      return NextResponse.json(
        { error: "Name parameter is required" },
        { status: 400 }
      );
    }

    let query = supabase
      .from("cities")
      .select("*")
      .ilike("name", `%${name}%`)
      .order("name")
      .limit(50);

    if (stateIdParam) {
      const stateId = parseInt(stateIdParam);
      if (!isNaN(stateId)) {
        query = query.eq("state_id", stateId);
      }
    }

    const { data: cities, error } = await query;

    if (error) {
      console.error("Error searching cities:", error);
      return NextResponse.json(
        { error: "Failed to search cities" },
        { status: 500 }
      );
    }

    // Convert to DTO format (camelCase)
    const citiesDTO = cities.map((city) => ({
      id: city.id,
      stateId: city.state_id,
      ibgeCode: city.ibge_code,
      name: city.name,
      zipCodeStart: city.zip_code_start,
      zipCodeEnd: city.zip_code_end,
      latitude: city.latitude,
      longitude: city.longitude,
      createdAt: city.created_at,
      updatedAt: city.updated_at,
    }));

    return NextResponse.json(citiesDTO);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/location/cities/[cityId]
 * Get city by ID with state information
 */
