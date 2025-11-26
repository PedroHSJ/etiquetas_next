import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { QuickEntryRequest, STOCK_MESSAGES } from "@/types/stock/stock";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common";
import { StockBackendService } from "@/lib/services/server/stockService";
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

    try {
      const supabase = getSupabaseBearerClient(token);
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error || !user) {
        console.error("Auth error in /api/estoque/entrada-rapida:", error);
        const errorResponse: ApiErrorResponse = {
          error: "User not authenticated",
        };
        return NextResponse.json(errorResponse, { status: 401 });
      }

      const body: QuickEntryRequest = await request.json();
      const stockService = new StockBackendService(supabase);
      if (!body.organizationId) {
        const errorResponse: ApiErrorResponse = {
          error: "organizationId is required",
        };
        return NextResponse.json(errorResponse, { status: 400 });
      }
      const result = await stockService.registerQuickEntry({
        productId: body.productId,
        quantity: body.quantity,
        unitOfMeasureCode: body.unit_of_measure_code,
        observation: body.observation,
        userId: user.id,
        organizationId: body.organizationId,
      });

      const response: ApiSuccessResponse<QuickEntryResponseDto> = {
        data: result,
        message: result.message || STOCK_MESSAGES.ENTRY_SUCCESS,
      };

      return NextResponse.json(response, { status: 200 });
    } catch (error) {
      console.error("Erro na API de entrada rápida:", error);
      const errorResponse: ApiErrorResponse = {
        error:
          error instanceof Error
            ? error.message
            : "Erro interno ao processar entrada rápida",
        details:
          error instanceof Error
            ? { message: error.message }
            : { message: "Unknown error" },
      };
      const statusCode =
        error instanceof Error &&
        error.message === STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND
          ? 404
          : 400;

      return NextResponse.json(errorResponse, { status: statusCode });
    }
  } catch (err) {
    console.error("Error on /api/estoque/entrada-rapida route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error in quick entry route",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
