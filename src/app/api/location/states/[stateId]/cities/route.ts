import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityResponseDto } from "@/types/dto/location/response";
import { CityEntity } from "@/types/database/location";
import { toCityResponseDto } from "@/lib/converters/location";

type RouteContext = {
  params: Promise<{ stateId: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
  const { stateId: stateIdParam } = await context.params;
  const response = NextResponse.next();
  const supabase = getSupabaseServerClient(request, response);

  const stateId = Number(stateIdParam);

  if (!Number.isFinite(stateId)) {
    const errorResponse: ApiErrorResponse = {
      error: "stateId must be a number",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from("cities")
      .select("*")
      .eq("state_id", stateId)
      .order("name");

    if (error) {
      const errorResponse: ApiErrorResponse = {
        error: "Failed to fetch cities",
        details: { message: error.message },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const dtos: CityResponseDto[] = (data || []).map((city) =>
      toCityResponseDto(city as CityEntity)
    );

    const success: ApiSuccessResponse<CityResponseDto[]> = {
      data: dtos,
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
