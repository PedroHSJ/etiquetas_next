import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import { UpdateOrganizationDto } from "@/types/dto/organization/request";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { OrganizationExpandedResponseDto } from "@/types/dto/organization/response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
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
    const org = await service.getByIdExpanded(id);

    const successResponse: ApiSuccessResponse<OrganizationExpandedResponseDto> =
      {
        data: org,
      };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err: unknown) {
    const errorResponse: ApiErrorResponse = {
      error: err instanceof Error ? err.message : "Error fetching organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const body = await request.json();
    const dto: UpdateOrganizationDto = body; // TODO: Add validation (Zod)

    const supabase = getSupabaseBearerClient(token);
    const service = new OrganizationBackendService(supabase);
    const updated = await service.updateExpanded(id, dto);

    const successResponse: ApiSuccessResponse<OrganizationExpandedResponseDto> =
      {
        data: updated,
      };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err: unknown) {
    const errorResponse: ApiErrorResponse = {
      error: err instanceof Error ? err.message : "Error updating organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
