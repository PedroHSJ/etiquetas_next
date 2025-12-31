import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { DepartmentBackendService } from "@/lib/services/server/departmentService";
import {
  ApiErrorResponse,
  ApiSuccessResponse,
} from "@/types/common/api";
import { UpdateDepartmentDto } from "@/types/dto/department";

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(
  request: NextRequest,
  context: RouteContext
) {
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

    const service = new DepartmentBackendService(supabase);
    const department = await service.getDepartmentById(id);

    if (!department) {
      const errorResponse: ApiErrorResponse = {
        error: "Department not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const successResponse: ApiSuccessResponse<typeof department> = {
      data: department,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/departments/[id] GET route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching department",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteContext
) {
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
    const dto: UpdateDepartmentDto = body;

    const service = new DepartmentBackendService(supabase);
    const updated = await service.updateDepartment(id, dto);

    const successResponse: ApiSuccessResponse<typeof updated> = {
      data: updated,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/departments/[id] PUT route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while updating department",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteContext
) {
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

    const service = new DepartmentBackendService(supabase);
    await service.deleteDepartment(id);

    const successResponse: ApiSuccessResponse<null> = {
      data: null,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Error on /api/departments/[id] DELETE route:", err);
    const errorResponse: ApiErrorResponse = {
      error:
        err instanceof Error
          ? err.message
          : "Internal error while deleting department",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
