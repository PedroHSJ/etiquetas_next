import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@/types/dto/organization/request";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { OrganizationResponseDto } from "@/types/dto/organization/response";

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
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const organizationService = new OrganizationBackendService(supabase);
    const organizations = await organizationService.listByUserId(user.id);

    const successResponse: ApiSuccessResponse<OrganizationResponseDto[]> = {
      data: organizations,
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
    const dto: CreateOrganizationDto = body; // TODO: Add validation (Zod)

    const organizationService = new OrganizationBackendService(supabase);
    const newOrganization = await organizationService.createOrganization(
      dto,
      user.id
    );

    const successResponse: ApiSuccessResponse<OrganizationResponseDto> = {
      data: newOrganization,
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
    const { id, ...updates } = body;
    const dto: UpdateOrganizationDto = updates; // TODO: Add validation (Zod)

    if (!id) {
      const errorResponse: ApiErrorResponse = {
        error: "Organization ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const organizationService = new OrganizationBackendService(supabase);
    const updatedOrganization = await organizationService.updateOrganization(
      id,
      dto
    );

    const successResponse: ApiSuccessResponse<OrganizationResponseDto> = {
      data: updatedOrganization,
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
