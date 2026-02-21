import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InviteBackendService } from "@/lib/services/server/inviteService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { headers } from "next/headers";

/**
 * POST /api/invites/cancel
 * Cancel an invite by ID
 */
export async function POST(request: NextRequest) {
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

    const body = await request.json();
    const { inviteId } = body;

    if (!inviteId) {
      const errorResponse: ApiErrorResponse = {
        error: "Missing required field: inviteId",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const inviteService = new InviteBackendService();
    await inviteService.cancelInvite(inviteId);

    const successResponse: ApiSuccessResponse<{ success: boolean }> = {
      data: { success: true },
      message: "Invite canceled successfully",
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    console.error("Error on POST /api/invites/cancel route:", error);
    const errorResponse: ApiErrorResponse = {
      error:
        error instanceof Error
          ? error.message
          : "Internal error while canceling invite",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
