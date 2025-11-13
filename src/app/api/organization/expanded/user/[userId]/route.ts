import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { OrganizationExpandedResponseDto } from "@/types/dto/organization/response";

export async function GET(
  request: NextRequest,
  { params }: { params: { userId: string } }
) {
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
    const service = new OrganizationBackendService(supabase);
    const orgs = await service.listByUserIdExpanded(params.userId);

    const successResponse: ApiSuccessResponse<
      OrganizationExpandedResponseDto[]
    > = {
      data: orgs,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err: any) {
    const errorResponse: ApiErrorResponse = {
      error: err.message || "Error fetching organizations",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
