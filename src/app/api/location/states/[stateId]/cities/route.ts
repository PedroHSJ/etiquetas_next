import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityResponseDto } from "@/types/dto/location/response";
import { LocationService } from "@/lib/services/server/locationService";

type RouteContext = {
  params: Promise<{ stateId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { stateId: stateIdParam } = await context.params;
  const stateId = Number(stateIdParam);

  if (!Number.isFinite(stateId)) {
    const errorResponse: ApiErrorResponse = {
      error: "stateId must be a number",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    const locationService = new LocationService();
    const result = await locationService.getCitiesByState(stateId);

    const success: ApiSuccessResponse<CityResponseDto[]> = {
      data: result as unknown as CityResponseDto[],
    };

    return NextResponse.json(success, { status: 200 });
  } catch (err) {
    console.error("Error on /api/location/states/[stateId]/cities:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
