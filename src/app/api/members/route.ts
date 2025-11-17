import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { MemberResponseDto } from "@/types/dto/member/response";
import { MemberBackendService } from "@/lib/services/server/memberService";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  const organizationId = request.nextUrl.searchParams.get("organizationId");

  if (!organizationId) {
    const errorResponse: ApiErrorResponse = {
      error: "organizationId is required",
    };
    return NextResponse.json(errorResponse, { status: 400 });
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

    const memberService = new MemberBackendService(supabase);
    const members = await memberService.listMembersByOrganization(
      organizationId
    );

    const successResponse: ApiSuccessResponse<MemberResponseDto[]> = {
      data: members,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/members route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching members",
      details:
        err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
