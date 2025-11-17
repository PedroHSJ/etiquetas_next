import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { StockBackendService } from "@/lib/services/server/stockService";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { StockStatistics } from "@/types/stock/stock";

export async function GET(request: NextRequest) {
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

    const stockService = new StockBackendService(supabase);
    const stats = await stockService.getStatistics();

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
