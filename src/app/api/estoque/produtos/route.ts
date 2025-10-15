import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { ProdutoSelect } from '@/types/estoque';

// Endpoint para buscar produtos para seleção na entrada rápida
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const termo = searchParams.get('q') || '';
    const limite = parseInt(searchParams.get('limit') || '50');

    // Query para buscar produtos com informações de estoque
    let query = supabase
      .from('produtos')
      .select(`
        id,
        nome,
        grupo_id,
        estoque:estoque(quantidade_atual)
      `);

    // Filtrar por nome se termo foi fornecido
    if (termo) {
      query = query.ilike('nome', `%${termo}%`);
    }

    // Aplicar limite e ordenação
    query = query
      .order('nome', { ascending: true })
      .limit(limite);

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar produtos' },
        { status: 500 }
      );
    }

    // Transformar dados para o formato esperado
    const produtos: ProdutoSelect[] = (data || []).map(produto => ({
      id: produto.id,
      nome: produto.nome,
      grupo_id: produto.grupo_id,
      // unidade_medida: produto.unidade_medida, // Adicionar quando disponível na tabela produtos
      estoque_atual: produto.estoque?.[0]?.quantidade_atual || 0,
    }));

    return NextResponse.json({
      success: true,
      data: produtos,
    });

  } catch (error) {
    console.error('Erro na API de produtos:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}