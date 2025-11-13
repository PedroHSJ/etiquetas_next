import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/location/cities/[cityId]
 * Returns city by ID with state information
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { cityId: string } }
) {
  const response = NextResponse.next();
  const supabase = getSupabaseServerClient(request, response);

  try {
    const cityId = parseInt(params.cityId);

    if (isNaN(cityId)) {
      return NextResponse.json({ error: "Invalid city ID" }, { status: 400 });
    }

    const { data: city, error } = await supabase
      .from("cities")
      .select(
        `
        *,
        state:states(*)
      `
      )
      .eq("id", cityId)
      .single();

    if (error) {
      console.error("Error fetching city:", error);
      return NextResponse.json({ error: "City not found" }, { status: 404 });
    }

    // Convert to DTO format (camelCase)
    const cityDTO = {
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
      state: city.state
        ? {
            id: city.state.id,
            code: city.state.code,
            name: city.state.name,
            region: city.state.region,
            createdAt: city.state.created_at,
          }
        : null,
    };

    return NextResponse.json(cityDTO);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
