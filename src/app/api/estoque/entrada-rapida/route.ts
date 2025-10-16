import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseServerClient } from '@/lib/supabaseServer';
import { EntradaRapidaRequest, EntradaRapidaResponse, ESTOQUE_MESSAGES } from '@/types/estoque';

export async function POST(request: NextRequest) {
  try {
    const body: EntradaRapidaRequest = await request.json();
    const { produto_id, quantidade, observacao } = body;

    // Validações básicas
    if (!produto_id || !quantidade) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'Produto e quantidade são obrigatórios' 
        } as EntradaRapidaResponse,
        { status: 400 }
      );
    }

    if (quantidade <= 0) {
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
    console.log('Usuário autenticado:', user);
    console.log('Erro ao obter usuário:', userError);
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
    const { data: produto, error: produtoError } = await supabase
      .from('produtos')
      .select('id, nome')
      .eq('id', produto_id)
      .single();

    if (produtoError || !produto) {
      return NextResponse.json(
        { 
          success: false, 
          message: ESTOQUE_MESSAGES.ERRO_PRODUTO_NAO_ENCONTRADO 
        } as EntradaRapidaResponse,
        { status: 404 }
      );
    }

    // Usar transação para garantir consistência
    const { data: movimentacao, error: movimentacaoError } = await supabase
      .from('estoque_movimentacoes')
      .insert({
        produto_id,
        usuario_id: user.id,
        tipo_movimentacao: 'ENTRADA',
        quantidade,
        observacao: observacao || `Entrada rápida - ${produto.nome}`,
      })
      .select(`
        *,
        produto:produtos(*)
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

    // Buscar estoque atualizado
    const { data: estoqueAtualizado, error: estoqueError } = await supabase
      .from('estoque')
      .select(`
        *,
        produto:produtos(*)
      `)
      .eq('produto_id', produto_id)
      .single();

    if (estoqueError) {
      console.warn('Erro ao buscar estoque atualizado:', estoqueError);
    }

    const response: EntradaRapidaResponse = {
      success: true,
      message: ESTOQUE_MESSAGES.ENTRADA_SUCESSO,
      movimentacao,
      estoque_atualizado: estoqueAtualizado || undefined,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de entrada rápida:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'Erro interno do servidor' 
      } as EntradaRapidaResponse,
      { status: 500 }
    );
  }
}