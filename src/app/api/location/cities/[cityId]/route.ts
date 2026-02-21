import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityResponseDto } from "@/types/dto/location/response";
import { LocationService } from "@/lib/services/server/locationService";

type RouteContext = {
  params: Promise<{ cityId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { cityId: cityIdParam } = await context.params;
  const cityId = Number(cityIdParam);

  if (!Number.isFinite(cityId)) {
    const errorResponse: ApiErrorResponse = {
      error: "cityId must be a number",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    const locationService = new LocationService();
    const result = await locationService.getCityById(cityId);

    if (!result) {
      const errorResponse: ApiErrorResponse = {
        error: "City not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const success: ApiSuccessResponse<CityResponseDto> = {
      data: result as unknown as CityResponseDto,
    };

    return NextResponse.json(success, { status: 200 });
  } catch (err) {
    console.error("Error on /api/location/cities/[cityId]:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
