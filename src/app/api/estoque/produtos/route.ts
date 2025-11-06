import { NextRequest, NextResponse } from "next/server";
import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { isUserAuthenticated } from "@/lib/auth";

// Endpoint para buscar produtos para seleção na entrada rápida
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termo = searchParams.get("q") || "";
    const limite = parseInt(searchParams.get("limit") || "50");

    // Obter client autenticado
    const supabase = getSupabaseServerClient(request);

    // Verificar autenticação
    // const { data: { user }, error: userError } = await supabase.auth.getUser();
    const isAuthenticated = await isUserAuthenticated(request);
    if (!isAuthenticated) {
      return NextResponse.json(
        { error: "Usuário não autorizado" },
        { status: 401 }
      );
    }

    // Query para buscar produtos com informações de estoque
    let query = supabase.from("products").select(`
        id,
        name,
        group_id,
        group:groups(*)
      `);

    // Filtrar por nome se termo foi fornecido
    if (termo) {
      query = query.ilike("name", `%${termo}%`);
    }

    // Aplicar limite e ordenação
    query = query.order("name", { ascending: true }).limit(limite);

    const { data: produtos, error } = await query;

    if (error) {
      console.error("Erro ao buscar produtos:", error);
      return NextResponse.json(
        {
          success: false,
          error: "Erro ao buscar produtos",
          details: error.message,
        },
        { status: 500 }
      );
    }

    // Agora buscar o estoque para cada produto
    const { data: estoque, error: estoqueError } = await supabase
      .from("stock")
      .select("product_id, current_quantity");

    if (estoqueError) {
      console.error("Erro ao buscar estoque:", estoqueError);
      // Continuar mesmo se falhar no estoque
    }

    // Criar mapa de estoque por product_id
    const estoqueMap = (estoque || []).reduce((acc: any, e: any) => {
      acc[e.product_id] = e.current_quantity;
      return acc;
    }, {});

    // Transformar dados para o formato esperado
    const produtosComEstoque = (produtos || []).map((produto: any) => ({
      id: produto.id,
      name: produto.name,
      group_id: produto.group_id,
      group: produto.group, // objeto completo do grupo
      stock: estoqueMap[produto.id] || 0,
    }));

    return NextResponse.json({
      success: true,
      data: produtosComEstoque,
    });
  } catch (error) {
    console.error("Erro na API de produtos:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json(
      {
        success: false,
        error: "Erro interno do servidor",
        details: errorMessage,
      },
      { status: 500 }
    );
  }
}
