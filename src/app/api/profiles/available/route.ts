import { ProfileBackendService } from "@/lib/services/server/profileService";
import { ApiErrorResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

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

    const profilesService = new ProfileBackendService();
    const profiles = await profilesService.getAvailableProfiles(
      session.user.id,
    );

    return NextResponse.json(profiles, { status: 200 });
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching available profiles",
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
