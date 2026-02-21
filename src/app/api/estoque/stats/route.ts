import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StockBackendService } from "@/lib/services/server/stockService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { StockStatistics } from "@/types/stock/stock";

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
    const organizationId = request.nextUrl.searchParams.get("organizationId");

    if (!organizationId) {
      const errorResponse: ApiErrorResponse = {
        error: "organizationId is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const stockService = new StockBackendService();
    const stats = await stockService.getStatistics(organizationId);

    const successResponse: ApiSuccessResponse<StockStatistics> = {
      data: stats,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro ao buscar estatísticas de estoque:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching stock statistics",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
