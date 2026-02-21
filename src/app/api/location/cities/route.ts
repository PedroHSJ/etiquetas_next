import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityResponseDto } from "@/types/dto/location/response";
import { LocationService } from "@/lib/services/server/locationService";

/**
 * GET /api/location/cities?name=...&stateId=...
 * Search cities by name (optionally filter by state)
 */
export async function GET(request: NextRequest) {
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

    const locationService = new LocationService();
    const result = await locationService.searchCitiesByName(
      name,
      stateIdParam ? parseInt(stateIdParam) : undefined,
    );

    const successResponse: ApiSuccessResponse<CityResponseDto[]> = {
      data: result as unknown as CityResponseDto[],
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
