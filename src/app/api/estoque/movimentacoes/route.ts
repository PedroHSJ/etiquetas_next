import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { StockBackendService } from "@/lib/services/server/stockService";
import { MovimentacoesFiltros } from "@/types/estoque";
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

    const filtros: MovimentacoesFiltros = {
      productId: searchParams.get("productId")
        ? parseInt(searchParams.get("productId")!)
        : undefined,
      userId: searchParams.get("userId") || undefined,
      tipo_movimentacao: searchParams.get("tipo_movimentacao") as
        | "ENTRADA"
        | "SAIDA"
        | undefined,
      data_inicio: searchParams.get("data_inicio") || undefined,
      data_fim: searchParams.get("data_fim") || undefined,
      produto_nome: searchParams.get("produto_nome") || undefined,
    };

    const stockService = new StockBackendService();
    const result = await stockService.listMovements({
      page,
      pageSize,
      filters: filtros,
      organizationId,
    });

    const successResponse: ApiSuccessResponse<any> = {
      data: result,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (err) {
    console.error("Erro na API de movimentações:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching stock movements",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}

// Endpoint para criar movimentação manual
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
    const {
      productId,
      tipo_movimentacao,
      quantidade,
      observacao,
      organizationId,
    } = body;

    // Validações básicas feitas pelo serviço agora, mas mantendo o retorno amigável da rota
    if (!productId || !tipo_movimentacao || !quantidade || !organizationId) {
      return NextResponse.json(
        {
          error:
            "Produto, tipo de movimentação, organização e quantidade são obrigatórios",
        },
        { status: 400 },
      );
    }

    const stockService = new StockBackendService();
    const result = await stockService.registerMovement({
      productId,
      movementType: tipo_movimentacao,
      quantity: quantidade,
      userId: session.user.id,
      organizationId: organizationId,
      observation: observacao,
    });

    return NextResponse.json({
      success: true,
      message: `${
        tipo_movimentacao === "ENTRADA" ? "Entrada" : "Saída"
      } registrada com sucesso!`,
      data: result,
    });
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
