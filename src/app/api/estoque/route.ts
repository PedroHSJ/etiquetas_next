import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StockBackendService } from "@/lib/services/server/stockService";
import { EstoqueFiltros } from "@/types/estoque";
import { StockListResponseDto } from "@/types/dto/stock/response";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";

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
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const organizationId = searchParams.get("organizationId");

    if (!organizationId) {
      const errorResponse: ApiErrorResponse = {
        error: "organizationId is required",
      };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const filtros: EstoqueFiltros = {
      produto_nome: searchParams.get("produto_nome") || undefined,
      productId: searchParams.get("productId")
        ? parseInt(searchParams.get("productId")!)
        : undefined,
      userId: searchParams.get("userId") || undefined,
      estoque_zerado: searchParams.get("estoque_zerado") === "true",
      estoque_baixo: searchParams.get("estoque_baixo") === "true",
      quantidade_minima: searchParams.get("quantidade_minima")
        ? parseFloat(searchParams.get("quantidade_minima")!)
        : undefined,
    };

    const stockService = new StockBackendService();
    const result = await stockService.listStock({
      page,
      pageSize,
      filters: filtros,
      organizationId,
    });

    const successResponse: ApiSuccessResponse<StockListResponseDto> = {
      data: result,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro na API de estoque:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching stock data",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
