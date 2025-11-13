import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";

/**
 * GET /api/location/states
 * Returns all Brazilian states
 */
export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  const supabase = getSupabaseServerClient(request, response);

  try {
    const { data: states, error } = await supabase
      .from("states")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching states:", error);
      return NextResponse.json(
        { error: "Failed to fetch states" },
        { status: 500 }
      );
    }

    // Convert to DTO format (camelCase)
    const statesDTO = states.map((state) => ({
      id: state.id,
      code: state.code,
      name: state.name,
      region: state.region,
      createdAt: state.created_at,
    }));

    return NextResponse.json(statesDTO);
  } catch (error) {
    console.error("Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
