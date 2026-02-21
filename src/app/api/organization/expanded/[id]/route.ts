import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import { UpdateOrganizationDto } from "@/types/dto/organization/request";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { OrganizationExpandedResponseDto } from "@/types/dto/organization/response";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { id } = await context.params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const errorResponse: ApiErrorResponse = {
      error: "Unauthorized",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const service = new OrganizationBackendService();
    const org = await service.getByIdExpanded(id);

    const successResponse: ApiSuccessResponse<OrganizationExpandedResponseDto> =
      {
        data: org as unknown as OrganizationExpandedResponseDto,
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
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const errorResponse: ApiErrorResponse = {
      error: "Unauthorized",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  try {
    const body = await request.json();
    const dto: UpdateOrganizationDto = body; // TODO: Add validation (Zod)

    const service = new OrganizationBackendService();
    const updated = await service.updateExpanded(id, dto);

    const successResponse: ApiSuccessResponse<OrganizationExpandedResponseDto> =
      {
        data: updated as unknown as OrganizationExpandedResponseDto,
      };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err: unknown) {
    const errorResponse: ApiErrorResponse = {
      error: err instanceof Error ? err.message : "Error updating organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
