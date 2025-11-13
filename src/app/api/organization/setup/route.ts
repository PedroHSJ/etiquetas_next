import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import { DepartmentBackendService } from "@/lib/services/server/departmentService";
import { CreateOrganizationDto } from "@/types/dto/organization/request";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";

interface SetupOrganizationRequest extends CreateOrganizationDto {
  departments?: Array<{ name: string; departmentType: string }>;
  managerProfileId: string;
}

interface SetupOrganizationResponse {
  organizationId: string;
  departmentsCreated: number;
}

/**
 * POST /api/organization/setup
 * Cria organização completa: organization + departments + vincula usuário
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
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body: SetupOrganizationRequest = await request.json();
    const { departments, managerProfileId, ...organizationData } = body;

    if (!managerProfileId) {
      const errorResponse: ApiErrorResponse = {
        error: "Manager profile ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 1. Criar organização
    const organizationService = new OrganizationBackendService(supabase);
    const organization = await organizationService.createOrganization(
      organizationData,
      user.id
    );

    // 2. Criar departments (se houver)
    let departmentsCreated = 0;
    if (departments && departments.length > 0) {
      const departmentService = new DepartmentBackendService(supabase);
      await departmentService.createDepartments(organization.id, departments);
      departmentsCreated = departments.length;
    }

    // 3. Vincular usuário à organização
    const departmentService = new DepartmentBackendService(supabase);
    const userOrganization = await departmentService.linkUserToOrganization(
      user.id,
      organization.id,
      managerProfileId
    );

    // 4. Criar user_profile
    await departmentService.createUserProfile(
      userOrganization.id,
      managerProfileId
    );

    const result: SetupOrganizationResponse = {
      organizationId: organization.id,
      departmentsCreated,
    };

    const successResponse: ApiSuccessResponse<SetupOrganizationResponse> = {
      data: result,
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (err) {
    console.error("Error on /api/organization/setup route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while setting up organization",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
