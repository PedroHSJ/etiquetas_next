import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@/types/dto/organization/request";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { OrganizationResponseDto } from "@/types/dto/organization/response";

export async function GET(request: NextRequest) {
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
    const organizationService = new OrganizationBackendService();
    const organizations = await organizationService.listByUserId(
      session.user.id,
    );

    const successResponse: ApiSuccessResponse<OrganizationResponseDto[]> = {
      data: organizations as unknown as OrganizationResponseDto[],
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/organization route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching organizations",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
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
    const dto: CreateOrganizationDto = body; // TODO: Add validation (Zod)

    const organizationService = new OrganizationBackendService();
    const newOrganization = await organizationService.createOrganization(
      dto,
      session.user.id,
    );

    const successResponse: ApiSuccessResponse<OrganizationResponseDto> = {
      data: newOrganization as unknown as OrganizationResponseDto,
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (err) {
    console.error("Error on /api/organization route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while creating organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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
    const { id, ...updates } = body;
    const dto: UpdateOrganizationDto = updates; // TODO: Add validation (Zod)

    if (!id) {
      const errorResponse: ApiErrorResponse = {
        error: "Organization ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const organizationService = new OrganizationBackendService();
    // TODO: Verify if user has permission to update this organization
    const updatedOrganization = await organizationService.updateOrganization(
      id,
      dto,
    );

    const successResponse: ApiSuccessResponse<OrganizationResponseDto> = {
      data: updatedOrganization as unknown as OrganizationResponseDto,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/organization route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while updating organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
