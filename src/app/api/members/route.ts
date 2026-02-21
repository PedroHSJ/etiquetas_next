import { NextRequest, NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { MemberResponseDto } from "@/types/dto/member/response";
import { MemberBackendService } from "@/lib/services/server/memberService";
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

    const organizationId = request.nextUrl.searchParams.get("organizationId");

    if (!organizationId) {
      const errorResponse: ApiErrorResponse = {
        error: "organizationId is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const memberService = new MemberBackendService();
    const members =
      await memberService.listMembersByOrganization(organizationId);

    const successResponse: ApiSuccessResponse<MemberResponseDto[]> = {
      data: members,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/members route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching members",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
