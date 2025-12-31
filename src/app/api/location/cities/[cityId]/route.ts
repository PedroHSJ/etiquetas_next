import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityResponseDto } from "@/types/dto/location/response";
import { CityEntity, StateEntity } from "@/types/database/location";
import { toCityResponseDto } from "@/lib/converters/location";

type RouteContext = {
  params: Promise<{ cityId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { cityId: cityIdParam } = await context.params;
  const response = NextResponse.next();
  const supabase = getSupabaseServerClient(request, response);

  const cityId = Number(cityIdParam);

  if (!Number.isFinite(cityId)) {
    const errorResponse: ApiErrorResponse = {
      error: "cityId must be a number",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    const { data, error } = await supabase
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
      const errorResponse: ApiErrorResponse = {
        error: "Failed to fetch city",
        details: { message: error.message },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    if (!data) {
      const errorResponse: ApiErrorResponse = {
        error: "City not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    type CityWithState = CityEntity & { state?: StateEntity };
    const dto: CityResponseDto = toCityResponseDto(
      data as unknown as CityWithState
    );

    const success: ApiSuccessResponse<CityResponseDto> = {
      data: dto,
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
