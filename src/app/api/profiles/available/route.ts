import { ProfileBackendService } from "@/lib/services/server/profileService";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse } from "@/types/common";
import { NextRequest, NextResponse } from "next/server";

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

    const profilesService = new ProfileBackendService(supabase);
    const profiles = await profilesService.getAvailableProfiles(user.id);

    return NextResponse.json(profiles, { status: 200 });
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching available profiles",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
