import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityResponseDto } from "@/types/dto/location/response";
import { CityEntity } from "@/types/database/location";
import { toCityResponseDto } from "@/lib/converters/location";

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
      const errorResponse: ApiErrorResponse = {
        error: "Name parameter is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
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
      const errorResponse: ApiErrorResponse = {
        error: "Failed to search cities",
        details: { message: error.message },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const citiesDTO: CityResponseDto[] = (cities || []).map((city) =>
      toCityResponseDto(city as CityEntity)
    );

    const successResponse: ApiSuccessResponse<CityResponseDto[]> = {
      data: citiesDTO,
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

/**
 * GET /api/location/cities/[cityId]
 * Get city by ID with state information
 */
