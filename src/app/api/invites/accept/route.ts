import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { InviteBackendService } from "@/lib/services/server/inviteService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";

/**
 * POST /api/invites/accept
 * Accept an invite
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { inviteToken } = body;

    if (!inviteToken) {
      const errorResponse: ApiErrorResponse = {
        error: "Missing required field: inviteToken",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const inviteService = new InviteBackendService(supabase);
    await inviteService.acceptInvite({
      inviteToken,
      userId: user.id,
    });

    const successResponse: ApiSuccessResponse<{ success: boolean }> = {
      data: { success: true },
      message: "Invite accepted successfully",
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: any) {
    console.error("Error on POST /api/invites/accept route:", error);
    const errorResponse: ApiErrorResponse = {
      error: error.message || "Internal error while accepting invite",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
