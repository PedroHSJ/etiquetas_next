import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { DepartmentBackendService } from "@/lib/services/server/departmentService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import {
  CreateDepartmentDto,
  ListDepartmentsDto,
} from "@/types/dto/department";
import { DepartmentWithOrganizationResponseDto } from "@/types/dto/department/response";

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
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId") || undefined;
    const search = searchParams.get("search") || undefined;

    const service = new DepartmentBackendService();
    const params: ListDepartmentsDto = {
      organizationId,
      search,
    };
    const departments = await service.listDepartments(params);

    const successResponse: ApiSuccessResponse<
      DepartmentWithOrganizationResponseDto[]
    > = {
      data: departments as unknown as DepartmentWithOrganizationResponseDto[],
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/departments route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching departments",
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
    const dto: CreateDepartmentDto = body;

    const service = new DepartmentBackendService();
    const department = await service.createDepartment(dto);

    const successResponse: ApiSuccessResponse<typeof department> = {
      data: department,
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (err) {
    console.error("Error on /api/departments POST route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while creating department",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
