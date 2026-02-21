import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { InviteBackendService } from "@/lib/services/server/inviteService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { AcceptInviteDto } from "@/types/dto/invite";
import { headers } from "next/headers";

/**
 * POST /api/invites/accept
 * Accept an invite
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

    const body: Pick<AcceptInviteDto, "inviteToken"> = await request.json();
    const { inviteToken } = body;

    if (!inviteToken) {
      const errorResponse: ApiErrorResponse = {
        error: "Missing required field: inviteToken",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const inviteService = new InviteBackendService();
    await inviteService.acceptInvite({
      inviteToken,
      userId: session.user.id,
    });

    const successResponse: ApiSuccessResponse<{ success: boolean }> = {
      data: { success: true },
      message: "Invite accepted successfully",
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error: unknown) {
    console.error("Error on POST /api/invites/accept route:", error);

    const errorResponse: ApiErrorResponse = {
      error:
        error instanceof Error
          ? error.message
          : "Internal error while accepting invite",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
