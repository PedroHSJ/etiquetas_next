import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { InviteBackendService } from "@/lib/services/server/inviteService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import {
  InviteWithRelationsResponseDto,
  CreateInviteDto,
  ListInvitesDto,
} from "@/types/dto/invite";

/**
 * GET /api/invites
 * List invites with optional filters
 */
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

    const user = session.user;

    // Get query parameters
    const email = request.nextUrl.searchParams.get("email") ?? undefined;
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const organizationId =
      request.nextUrl.searchParams.get("organizationId") ?? undefined;
    const pending = request.nextUrl.searchParams.get("pending") === "true";
    const scope = request.nextUrl.searchParams.get("scope") ?? undefined;

    const inviteService = new InviteBackendService();

    // If pending flag is true, get only pending invites for user's email
    if (pending && user.email) {
      const invites = await inviteService.getPendingInvites(user.email);
      const successResponse: ApiSuccessResponse<
        InviteWithRelationsResponseDto[]
      > = {
        data: invites,
      };
      return NextResponse.json(successResponse, { status: 200 });
    }

    // Otherwise, list with filters
    console.log("Listing invites with filters");

    if (scope === "organization" && !organizationId) {
      const errorResponse: ApiErrorResponse = {
        error: "organizationId is required for scope=organization",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const filters: ListInvitesDto = {
      // Se scope for organização, não filtra por email pessoal.
      // Se não, filtra por email (meus convites).
      // Lógica original: email: scope === "organization" ? undefined : email || user.email
      email: scope === "organization" ? undefined : email || user.email,
      status: status as any, // Cast para tipo status
      organizationId,
    };

    const invites = await inviteService.listInvites(filters);
    console.log("Found invites:", invites.length);

    const successResponse: ApiSuccessResponse<
      InviteWithRelationsResponseDto[]
    > = {
      data: invites,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error on /api/invites route:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching invites",
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

/**
 * POST /api/invites
 * Create a new invite
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

    const user = session.user;
    const body: CreateInviteDto = await request.json();
    const { email, organizationId, profileId } = body;

    if (!email || !organizationId || !profileId) {
      const errorResponse: ApiErrorResponse = {
        error: "Missing required fields: email, organizationId, profileId",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const inviteService = new InviteBackendService();

    // Better Auth user object has name, email, image directly
    const invitedByName = user.name || user.email || null;
    const invitedByEmail = user.email || null;
    const invitedByAvatarUrl = user.image || null;

    const invite = await inviteService.createInvite({
      email,
      organizationId,
      profileId,
      invitedBy: user.id,
      invitedByName,
      invitedByEmail,
      invitedByAvatarUrl,
    });

    const successResponse: ApiSuccessResponse<InviteWithRelationsResponseDto> =
      {
        data: invite,
      };
    return NextResponse.json(successResponse, { status: 201 });
  } catch (error) {
    console.error("Error on POST /api/invites route:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while creating invite",
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
