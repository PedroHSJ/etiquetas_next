import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import {
  QuickEntryRequest,
  QuickEntryResponse,
  STOCK_MESSAGES,
} from "@/types/stock/stock";

export async function POST(request: NextRequest) {
  try {
    const body: QuickEntryRequest = await request.json();
    const { productId, quantity, observation } = body;

    // Validações básicas
    if (!productId || !quantity) {
      return NextResponse.json(
        {
          success: false,
          message: "Produto e quantidade são obrigatórios",
        } as QuickEntryResponse,
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        {
          success: false,
          message: STOCK_MESSAGES.ERROR_INVALID_QUANTITY,
        } as QuickEntryResponse,
        { status: 400 }
      );
    }

    // Obter usuário autenticado usando client server-side
    const supabase = getSupabaseServerClient(request);
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    console.log("Usuário autenticado:", user);
    console.log("Erro ao obter usuário:", userError);
    if (userError || !user) {
      return NextResponse.json(
        {
          success: false,
          message: STOCK_MESSAGES.ERROR_USER_NOT_AUTHORIZED,
        } as QuickEntryResponse,
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
        {
          success: false,
          message: STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND,
        } as QuickEntryResponse,
        { status: 404 }
      );
    }

    // Usar transação para garantir consistência
    const { data: movimentacao, error: movimentacaoError } = await supabase
      .from("stock_movements")
      .insert({
        productId,
        userId: user.id,
        movement_type: "ENTRADA",
        quantity,
        observation: observation || `Entrada rápida - ${produto.name}`,
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
        {
          success: false,
          message: "Erro ao registrar movimentação de estoque",
        } as QuickEntryResponse,
        { status: 500 }
      );
    }

    // Buscar estoque atualizado
    const { data: estoqueAtualizado, error: estoqueError } = await supabase
      .from("stock")
      .select(
        `
        *,
        product:products(*)
      `
      )
      .eq("productId", productId)
      .single();

    if (estoqueError) {
      console.warn("Erro ao buscar estoque atualizado:", estoqueError);
    }

    const response: QuickEntryResponse = {
      success: true,
      message: STOCK_MESSAGES.ENTRY_SUCCESS,
      movement: movimentacao,
      updated_stock: estoqueAtualizado || undefined,
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Erro na API de entrada rápida:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Erro interno do servidor",
      } as QuickEntryResponse,
      { status: 500 }
    );
  }
}
