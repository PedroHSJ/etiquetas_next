import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { QuickEntryRequest, STOCK_MESSAGES } from "@/types/stock/stock";
import { StockBackendService } from "@/lib/services/server/stockService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { QuickEntryResponseDto } from "@/types/dto/stock/response";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      const errorResponse: ApiErrorResponse = {
        error: "Access token not provided",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body: QuickEntryRequest = await request.json();
    const stockService = new StockBackendService(supabase);

    const result = await stockService.registerQuickExit({
      productId: body.productId,
      quantity: body.quantity,
      unitOfMeasureCode: body.unit_of_measure_code,
      observation: body.observation,
      userId: user.id,
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
      details:
        error instanceof Error ? { message: error.message } : undefined,
    };

    const statusCode =
      error instanceof Error &&
      error.message === STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND
        ? 404
        : 400;

    return NextResponse.json(errorResponse, { status: statusCode });
  }
}
