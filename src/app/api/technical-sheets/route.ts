import { NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth";
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

const createSchema = z.object({
  dishName: z.string().min(1),
  servings: z.number().int().positive(),
  preparationTime: z.string().optional(),
  cookingTime: z.string().optional(),
  difficulty: z.string().optional(),
  preparationSteps: z.array(z.string()).optional(),
  nutritionalInsights: z.record(z.string(), z.any()).optional(),
  organizationId: z.string().uuid(),
  ingredients: z.array(ingredientSchema).optional(),
  active: z.boolean().optional(),
});

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

  const searchParams = request.nextUrl.searchParams;
  const organizationId = searchParams.get("organizationId");

  if (!organizationId) {
    const errorResponse: ApiErrorResponse = {
      error: "organizationId is required",
    };
    return NextResponse.json(errorResponse, { status: 400 });
  }

  const page = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = parseInt(searchParams.get("pageSize") || "12", 10);
  const difficulty = searchParams.get("difficulty") || undefined;
  const activeParam = searchParams.get("active");
  const active = activeParam === null ? true : activeParam === "true";

  try {
    const service = new TechnicalSheetBackendService();
    // TODO: Verify permissions
    const result = await service.list({
      page,
      pageSize,
      organizationId,
      difficulty,
      active,
    });

    const successResponse: ApiSuccessResponse<typeof result> = {
      data: result,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro ao listar fichas técnicas:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching technical sheets",
      details: err instanceof Error ? { message: err.message } : undefined,
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
    const parsed = createSchema.safeParse(body);

    if (!parsed.success) {
      const errorResponse: ApiErrorResponse = {
        error: "Invalid request body",
        details: parsed.error.flatten().fieldErrors,
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const service = new TechnicalSheetBackendService();
    const created = await service.create(parsed.data, session.user.id);

    const successResponse: ApiSuccessResponse<typeof created> = {
      data: created,
    };

    return NextResponse.json(successResponse, { status: 201 });
  } catch (err) {
    console.error("Erro ao criar ficha técnica:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while creating technical sheet",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
