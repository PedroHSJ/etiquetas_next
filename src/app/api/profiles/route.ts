import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProfileBackendService } from "@/lib/services/server/profileService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { ProfileResponseDto } from "@/types/dto/profile";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const search = request.nextUrl.searchParams.get("search") ?? undefined;
    const includeInactive =
      request.nextUrl.searchParams.get("includeInactive") === "true";

    const profilesService = new ProfileBackendService();
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
