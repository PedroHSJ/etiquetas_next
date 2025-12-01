import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { TechnicalSheetBackendService } from "@/lib/services/server/technicalSheetService";

const ingredientSchema = z.object({
  ingredientName: z.string().min(1),
  quantity: z.string().min(1),
  unit: z.string().min(1),
  originalQuantity: z.string().min(1),
  productId: z.number().int().optional(),
  sortOrder: z.number().int().min(0).optional(),
});

const updateSchema = z
  .object({
    dishName: z.string().min(1).optional(),
    servings: z.number().int().positive().optional(),
    preparationTime: z.string().optional(),
    cookingTime: z.string().optional(),
    difficulty: z.string().optional(),
    preparationSteps: z.array(z.string()).optional(),
    nutritionalInsights: z.record(z.string(), z.any()).optional(),
    organizationId: z.string().uuid(),
    ingredients: z.array(ingredientSchema).optional(),
    active: z.boolean().optional(),
  })
  .strict();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  const organizationId = request.nextUrl.searchParams.get("organizationId");

  if (!organizationId) {
    const errorResponse: ApiErrorResponse = {
      error: "organizationId is required",
    };
    return NextResponse.json(errorResponse, { status: 400 });
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

    const { id } = await params;
    const service = new TechnicalSheetBackendService(supabase);
    const sheet = await service.getById(id, organizationId);

    if (!sheet) {
      const errorResponse: ApiErrorResponse = {
        error: "Technical sheet not found",
      };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const successResponse: ApiSuccessResponse<typeof sheet> = {
      data: sheet,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro ao buscar ficha técnica:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching technical sheet",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
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
    const body = await request.json();
    const parsed = updateSchema.safeParse(body);

    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

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

    const { id } = await params;
    const service = new TechnicalSheetBackendService(supabase);
    const updated = await service.update(id, parsed.data);

    const successResponse: ApiSuccessResponse<typeof updated> = {
      data: updated,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro ao atualizar ficha técnica:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while updating technical sheet",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    return NextResponse.json(errorResponse, { status: 401 });
  }

  const organizationId = request.nextUrl.searchParams.get("organizationId");

  if (!organizationId) {
    const errorResponse: ApiErrorResponse = {
      error: "organizationId is required",
    };
    return NextResponse.json(errorResponse, { status: 400 });
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

    const { id } = await params;
    const service = new TechnicalSheetBackendService(supabase);
    await service.delete(id, organizationId);

    const successResponse: ApiSuccessResponse<{ id: string }> = {
      data: { id },
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro ao remover ficha técnica:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while deleting technical sheet",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
