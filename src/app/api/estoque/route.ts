import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { EstoqueFiltros, EstoqueListResponse } from '@/types/estoque';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    // Filtros
    const filtros: EstoqueFiltros = {
      produto_nome: searchParams.get('produto_nome') || undefined,
      product_id: searchParams.get('product_id') ? parseInt(searchParams.get('product_id')!) : undefined,
      user_id: searchParams.get('user_id') || undefined,
      estoque_zerado: searchParams.get('estoque_zerado') === 'true',
      estoque_baixo: searchParams.get('estoque_baixo') === 'true',
      quantidade_minima: searchParams.get('quantidade_minima') ? parseFloat(searchParams.get('quantidade_minima')!) : undefined,
    };

    // Query base para estoque com join de produtos
    let query = supabase
      .from('stock')
      .select(`
        *,
        product:products(*)
      `, { count: 'exact' });

    // Aplicar filtros
    if (filtros.product_id) {
      query = query.eq('product_id', filtros.product_id);
    }

    if (filtros.user_id) {
      query = query.eq('user_id', filtros.user_id);
    }

    if (filtros.estoque_zerado) {
      query = query.eq('current_quantity', 0);
    } else if (filtros.estoque_baixo && filtros.quantidade_minima) {
      query = query.lt('current_quantity', filtros.quantidade_minima);
      query = query.gt('current_quantity', 0);
    }

    // Filtro por nome do produto (usando inner join)
    if (filtros.produto_nome) {
      query = query.ilike('product.name', `%${filtros.produto_nome}%`);
    }

    // Aplicar paginação e ordenação
    query = query
      .order('updated_at', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar estoque:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar dados do estoque' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    const response: EstoqueListResponse = {
      data: (data as any[]) || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de estoque:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}
