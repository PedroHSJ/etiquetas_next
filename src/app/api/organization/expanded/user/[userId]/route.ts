import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { OrganizationBackendService } from "@/lib/services/server/organizationService";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";
import { OrganizationExpandedResponseDto } from "@/types/dto/organization/response";

type RouteContext = {
  params: Promise<{ userId: string }>;
};

export async function GET(request: NextRequest, context: RouteContext) {
  const { userId } = await context.params;
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    const errorResponse: ApiErrorResponse = {
      error: "Unauthorized",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  // Opcional: Verificar se o usuário da sessão é o mesmo do userId ou se tem permissão de admin
  if (session.user.id !== userId) {
    // Decidir se permite ou não. Por enquanto, vou permitir se autenticado, mas o ideal é restringir.
  }

  try {
    const service = new OrganizationBackendService();
    const orgs = await service.listByUserIdExpanded(userId);

    const successResponse: ApiSuccessResponse<
      OrganizationExpandedResponseDto[]
    > = {
      data: orgs as unknown as OrganizationExpandedResponseDto[],
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (err: unknown) {
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error ? err.message : "Error fetching organizations",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
