import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { StockBackendService } from "@/lib/services/server/stockService";
import {
  MovimentacoesFiltros,
  MovimentacoesListResponse,
} from "@/types/estoque";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";

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

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");

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

    const stockService = new StockBackendService(supabase);
    const result = await stockService.listMovements({
      page,
      pageSize,
      filters: filtros,
    });

    const successResponse: ApiSuccessResponse<MovimentacoesListResponse> = {
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

// Endpoint para criar movimentação manual (saída, por exemplo)
export async function POST(request: NextRequest) {
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
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "Usuário não autorizado" },
        { status: 401 }
      );
    }

    const { productId, tipo_movimentacao, quantidade, observacao } =
      await request.json();

    // Validações básicas
    if (!productId || !tipo_movimentacao || !quantidade) {
      return NextResponse.json(
        {
          error: "Produto, tipo de movimentação e quantidade são obrigatórios",
        },
        { status: 400 }
      );
    }

    if (!["ENTRADA", "SAIDA"].includes(tipo_movimentacao)) {
      return NextResponse.json(
        { error: "Tipo de movimentação deve ser ENTRADA ou SAIDA" },
        { status: 400 }
      );
    }

    if (quantidade <= 0) {
      return NextResponse.json(
        { error: "Quantidade deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Verificar se o produto existe
    const { data: produto, error: produtoError } = await supabase
      .from("products")
      .select("id, name")
      .eq("id", productId)
      .single();

    if (produtoError || !produto) {
      return NextResponse.json(
        { error: "Produto não encontrado" },
        { status: 404 }
      );
    }

    // Se for saída, verificar se há estoque suficiente
    if (tipo_movimentacao === "SAIDA") {
      const { data: estoque } = await supabase
        .from("stock")
        .select("current_quantity")
        .eq("productId", productId)
        .single();

      if (!estoque || estoque.current_quantity < quantidade) {
        return NextResponse.json(
          {
            error: `Quantidade insuficiente em estoque. Disponível: ${estoque?.current_quantity || 0}`,
          },
          { status: 400 }
        );
      }
    }

    // Criar movimentação
    const { data: movimentacao, error: movimentacaoError } = await supabase
      .from("stock_movements")
      .insert({
        productId,
        userId: user.id,
        movement_type: tipo_movimentacao,
        quantity: quantidade,
        observation:
          observacao ||
          `${tipo_movimentacao.toLowerCase()} manual - ${produto.name}`,
      })
      .select(
        `
        *,
        product:products(*)
      `
      )
      .single();

    if (movimentacaoError) {
      console.error("Erro ao criar movimentação:", movimentacaoError);
      return NextResponse.json(
        { error: "Erro ao registrar movimentação" },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${tipo_movimentacao === "ENTRADA" ? "Entrada" : "Saída"} registrada com sucesso!`,
      data: movimentacao,
    });
  } catch (error) {
    console.error("Erro ao criar movimentação:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}
