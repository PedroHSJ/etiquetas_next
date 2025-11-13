import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ProfileBackendService } from "@/lib/services/server/profileService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { ProfileResponseDto } from "@/types/dto/profile";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const includeInactive =
      request.nextUrl.searchParams.get("includeInactive") === "true";

    const profilesService = new ProfileBackendService(supabase);
    const profiles = await profilesService.listProfiles({
      search,
      activeOnly: !includeInactive,
    });

    const successResponse: ApiSuccessResponse<ProfileResponseDto[]> = {
      data: profiles,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error on /api/profiles route:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching profiles",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
