import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { StateResponseDto } from "@/types/dto/location/response";
import { LocationService } from "@/lib/services/server/locationService";

/**
 * GET /api/location/states
 * Returns all Brazilian states
 */
export async function GET(request: NextRequest) {
  try {
    const locationService = new LocationService();
    const result = await locationService.getAllStates();

    const successResponse: ApiSuccessResponse<StateResponseDto[]> = {
      data: result as unknown as StateResponseDto[],
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
