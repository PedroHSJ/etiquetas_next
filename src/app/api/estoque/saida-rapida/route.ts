import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { EntradaRapidaRequest, EntradaRapidaResponse, ESTOQUE_MESSAGES } from '@/types/estoque';

export async function POST(request: NextRequest) {
  try {
    const body: EntradaRapidaRequest = await request.json();
    const { product_id, quantity, observation } = body;

    // Validações básicas
    if (!product_id || !quantity) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Produto e quantidade são obrigatórios' 
        } as EntradaRapidaResponse,
        { status: 400 }
      );
    }

    if (quantity <= 0) {
      return NextResponse.json(
        { 
          success: false, 
          message: ESTOQUE_MESSAGES.ERRO_QUANTIDADE_INVALIDA 
        } as EntradaRapidaResponse,
        { status: 400 }
      );
    }

    // Obter usuário autenticado usando client server-side
    const supabase = getSupabaseServerClient(request);
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { 
          success: false, 
          message: ESTOQUE_MESSAGES.ERRO_USUARIO_NAO_AUTORIZADO 
        } as EntradaRapidaResponse,
        { status: 401 }
      );
    }

    // Verificar se o produto existe
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, name')
      .eq('id', product_id)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { 
          success: false, 
          message: ESTOQUE_MESSAGES.ERRO_PRODUTO_NAO_ENCONTRADO 
        } as EntradaRapidaResponse,
        { status: 404 }
      );
    }

    // Verificar estoque atual
    const { data: estoque, error: estoqueError } = await supabase
      .from('stock')
      .select('*')
      .eq('product_id', product_id)
      .single();

    if (estoqueError || !estoque) {
      return NextResponse.json(
        { 
          success: false, 
          message: ESTOQUE_MESSAGES.ERRO_PRODUTO_NAO_ENCONTRADO 
        } as EntradaRapidaResponse,
        { status: 404 }
      );
    }

    // Validar quantidade disponível
    if (estoque.current_quantity < quantity) {
      return NextResponse.json(
        { 
          success: false, 
          message: ESTOQUE_MESSAGES.ERRO_QUANTIDADE_INSUFICIENTE 
        } as EntradaRapidaResponse,
        { status: 400 }
      );
    }

    // Registrar movimentação de saída
    const { data: movimentacao, error: movimentacaoError } = await supabase
      .from('stock_movements')
      .insert({
        product_id,
        user_id: user.id,
        movement_type: 'SAIDA',
        quantity: quantity,
        observation: observation || `Saída rápida - ${product.name}`,
      })
      .select(`
        *,
        product:products(*)
      `)
      .single();

    if (movimentacaoError) {
      console.error('Erro ao criar movimentação:', movimentacaoError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao registrar movimentação de estoque' 
        } as EntradaRapidaResponse,
        { status: 500 }
      );
    }

    // Atualizar estoque (diminuir quantidade)
    const { data: estoqueAtualizado, error: atualizacaoError } = await supabase
      .from('stock')
      .update({
        current_quantity: estoque.current_quantity - quantity,
        updated_at: new Date().toISOString(),
      })
      .eq('id', estoque.id)
      .select(`
        *,
        produto:produtos(*)
      `)
      .single();

    if (atualizacaoError) {
      console.error('Erro ao atualizar estoque:', atualizacaoError);
      return NextResponse.json(
        { 
          success: false, 
          message: 'Erro ao atualizar estoque' 
        } as EntradaRapidaResponse,
        { status: 500 }
      );
    }

    const response: EntradaRapidaResponse = {
      success: true,
      message: ESTOQUE_MESSAGES.SAIDA_SUCESSO,
      movimentacao,
      estoque_atualizado: estoqueAtualizado || undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de saída rápida:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      } as EntradaRapidaResponse,
      { status: 500 }
    );
  }
}
