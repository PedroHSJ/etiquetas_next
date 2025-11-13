import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/location/states/[stateId]/cities
 * Returns all cities from a specific state
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { stateId: string } }
) {
  const response = NextResponse.next();
  const supabase = getSupabaseServerClient(request, response);

  try {
    const stateId = parseInt(params.stateId);

    if (isNaN(stateId)) {
      return NextResponse.json({ error: "Invalid state ID" }, { status: 400 });
    }

    const { data: cities, error } = await supabase
      .from("cities")
      .select("*")
      .eq("state_id", stateId)
      .order("name");

    if (error) {
      console.error("Error fetching cities:", error);
      return NextResponse.json(
        { error: "Failed to fetch cities" },
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
