import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { InviteBackendService } from "@/lib/services/server/inviteService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { InviteWithRelationsResponseDto } from "@/types/dto/invite";

/**
 * GET /api/invites
 * List invites with optional filters
 */
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
      console.error("Auth error in /api/invites:", error);
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    // Get query parameters
    const email = request.nextUrl.searchParams.get("email") ?? undefined;
    const status = request.nextUrl.searchParams.get("status") ?? undefined;
    const organizationId =
      request.nextUrl.searchParams.get("organizationId") ?? undefined;
    const pending = request.nextUrl.searchParams.get("pending") === "true";
    const scope = request.nextUrl.searchParams.get("scope") ?? undefined;

    const inviteService = new InviteBackendService(supabase);

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

    const invites = await inviteService.listInvites({
      email: scope === "organization" ? undefined : email || user.email,
      status,
      organizationId,
    });
    console.log("Found invites:", invites.length);

    const successResponse: ApiSuccessResponse<
      InviteWithRelationsResponseDto[]
    > = {
      data: invites,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error on /api/invites route:", error);
    console.error("Error details:", JSON.stringify(error, null, 2));
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
    const { email, organizationId, profileId } = body;

    if (!email || !organizationId || !profileId) {
      const errorResponse: ApiErrorResponse = {
        error: "Missing required fields: email, organizationId, profileId",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const inviteService = new InviteBackendService(supabase);

    const metadata = (user.user_metadata || {}) as Record<string, any>;
    const invitedByName =
      metadata.name || metadata.full_name || user.email || null;
    const invitedByEmail = user.email ?? null;
    const invitedByAvatarUrl =
      metadata.avatar_url || metadata.picture || null;

    const invite = await inviteService.createInvite({
      email,
      organizationId,
      profileId,
      invitedBy: user.id,
      invitedByName,
      invitedByEmail,
      invitedByAvatarUrl,
    });

    const successResponse: ApiSuccessResponse<
      InviteWithRelationsResponseDto
    > = {
      data: invite,
    };
    return NextResponse.json(successResponse, { status: 201 });
  } catch (error) {
    console.error("Error on POST /api/invites route:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while creating invite",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
