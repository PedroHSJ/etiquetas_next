import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { StateResponseDto } from "@/types/dto/location/response";
import { toStateResponseDto } from "@/lib/converters/location";

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
      const errorResponse: ApiErrorResponse = {
        error: "Failed to fetch states",
        details: { message: error.message },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const statesDTO: StateResponseDto[] = (states || []).map(
      toStateResponseDto
    );

    const successResponse: ApiSuccessResponse<StateResponseDto[]> = {
      data: statesDTO,
    };

    return NextResponse.json(successResponse);
  } catch (error) {
    console.error("Unexpected error:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
