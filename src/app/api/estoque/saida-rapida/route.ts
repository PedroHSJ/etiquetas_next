import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { QuickEntryRequest, STOCK_MESSAGES } from "@/types/stock/stock";
import { StockBackendService } from "@/lib/services/server/stockService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { QuickEntryResponseDto } from "@/types/dto/stock/response";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const errorResponse: ApiErrorResponse = {
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body: QuickEntryRequest = await request.json();
    const stockService = new StockBackendService();

    if (!body.organizationId) {
      const errorResponse: ApiErrorResponse = {
        error: "organizationId is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const result = await stockService.registerQuickExit({
      productId: body.productId,
      quantity: body.quantity,
      unitOfMeasureCode: body.unitOfMeasureCode,
      observation: body.observation,
      userId: session.user.id,
      organizationId: body.organizationId,
    });

    const successResponse: ApiSuccessResponse<QuickEntryResponseDto> = {
      data: result,
      message: result.message || STOCK_MESSAGES.EXIT_SUCCESS,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Erro na API de saída rápida:", error);
    const errorResponse: ApiErrorResponse = {
      error:
        error instanceof Error
          ? error.message
          : "Erro interno ao processar saída rápida",
      details: error instanceof Error ? { message: error.message } : undefined,
    };

    const statusCode =
      error instanceof Error &&
      error.message === STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND
        ? 404
        : 400;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
