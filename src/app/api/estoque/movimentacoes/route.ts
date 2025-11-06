import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import {
  MovimentacoesFiltros,
  MovimentacoesListResponse,
} from "@/types/estoque";
import { StockMovement } from "@/types/stock/stock";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    // Parâmetros de paginação
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "20");
    const offset = (page - 1) * pageSize;

    // Filtros
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

    // Query base para movimentações com join de produtos
    let query = supabase.from("stock_movements").select(
      `
        *,
        product:products(*)
      `,
      { count: "exact" }
    );

    // Aplicar filtros
    if (filtros.productId) {
      query = query.eq("productId", filtros.productId);
    }

    if (filtros.userId) {
      query = query.eq("userId", filtros.userId);
    }

    if (filtros.tipo_movimentacao) {
      query = query.eq("movement_type", filtros.tipo_movimentacao);
    }

    if (filtros.data_inicio) {
      query = query.gte("movement_date", filtros.data_inicio);
    }

    if (filtros.data_fim) {
      // Adicionar 23:59:59 ao final do dia
      const dataFimCompleta = new Date(filtros.data_fim);
      dataFimCompleta.setHours(23, 59, 59, 999);
      query = query.lte("movement_date", dataFimCompleta.toISOString());
    }

    // Filtro por nome do produto (usando inner join)
    if (filtros.produto_nome) {
      query = query.ilike("product.name", `%${filtros.produto_nome}%`);
    }

    // Aplicar paginação e ordenação (mais recentes primeiro)
    query = query
      .order("movement_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error("Erro ao buscar movimentações:", error);
      return NextResponse.json(
        { error: "Erro ao buscar histórico de movimentações" },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    const response: MovimentacoesListResponse = {
      data: (data as unknown as StockMovement[]) || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro na API de movimentações:", error);
    return NextResponse.json(
      { error: "Erro interno do servidor" },
      { status: 500 }
    );
  }
}

// Endpoint para criar movimentação manual (saída, por exemplo)
export async function POST(request: NextRequest) {
  try {
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

    // Obter usuário autenticado
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
