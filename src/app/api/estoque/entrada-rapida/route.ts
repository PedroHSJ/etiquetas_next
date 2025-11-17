import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseBearerClient,
  getSupabaseServerClient,
} from "@/lib/supabaseServer";
import {
  QuickEntryRequest,
  QuickEntryResponse,
  STOCK_MESSAGES,
} from "@/types/stock/stock";
import { authRoute } from "@/utils/supabase/auth-route";
import { ApiErrorResponse } from "@/types/common";

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
        console.error("Auth error in /api/invites:", error);
        const errorResponse: ApiErrorResponse = {
          error: "User not authenticated",
        };
        return NextResponse.json(errorResponse, { status: 401 });
      }

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

      // Obter unidade já existente (se houver)
      const { data: stockExists } = await supabase
        .from("stock")
        .select("unit_of_measure_code")
        .eq("productId", productId)
        .maybeSingle();

      const unitCode =
        (stockExists?.unit_of_measure_code as string | undefined) ?? "un";

      // Usar transação para garantir consistência
      const { data: movimentacao, error: movimentacaoError } = await supabase
        .from("stock_movements")
        .insert({
          productId,
          userId: user.id,
          movement_type: "ENTRADA",
          quantity,
          unit_of_measure_code: unitCode,
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
  } catch (err) {
    console.error("Error on /api/estoque/entrada-rapida route:", err);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error in quick entry route",
      details: err instanceof Error ? { message: err.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
