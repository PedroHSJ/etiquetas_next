import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
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
    const body: SetupOrganizationRequest = await request.json();
    const { departments, managerProfileId, ...organizationData } = body;

    // TODO: Adicionar validação de permissão para criar organização se necessário
    // Por enquanto qualquer usuário autenticado pode criar.

    if (!managerProfileId) {
      const errorResponse: ApiErrorResponse = {
        error: "Manager profile ID is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // 1. Criar organização
    const organizationService = new OrganizationBackendService();
    const organization = await organizationService.createOrganization(
      organizationData,
      session.user.id,
    );

    // 2. Criar departments (se houver) e vincular usuário, perfil
    let departmentsCreated = 0;
    const departmentService = new DepartmentBackendService();

    if (departments && departments.length > 0) {
      await departmentService.createDepartments(organization.id, departments);
      departmentsCreated = departments.length;
    }

    // 3. Vincular usuário à organização
    const userOrganization = await departmentService.linkUserToOrganization(
      session.user.id,
      organization.id,
      managerProfileId,
    );

    // 4. Criar user_profile (se necessário)
    // O setup original criava user_profile. Vou manter.
    await departmentService.createUserProfile(
      // @ts-ignore
      userOrganization.id,
      managerProfileId,
    );

    // TODO: Atualizar sessão do usuário para refletir nova organização se usar claim customizada
    // Como melhoria, poderia atualizar o cookie aqui se o better auth permitir, ou instruir frontend a relogar/refresh.

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
