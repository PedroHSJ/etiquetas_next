import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabaseClient';
import { MovimentacoesFiltros, MovimentacoesListResponse } from '@/types/estoque';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    
    // Parâmetros de paginação
    const page = parseInt(searchParams.get('page') || '1');
    const pageSize = parseInt(searchParams.get('pageSize') || '20');
    const offset = (page - 1) * pageSize;

    // Filtros
    const filtros: MovimentacoesFiltros = {
      produto_id: searchParams.get('produto_id') ? parseInt(searchParams.get('produto_id')!) : undefined,
      usuario_id: searchParams.get('usuario_id') || undefined,
      tipo_movimentacao: searchParams.get('tipo_movimentacao') as 'ENTRADA' | 'SAIDA' | undefined,
      data_inicio: searchParams.get('data_inicio') || undefined,
      data_fim: searchParams.get('data_fim') || undefined,
      produto_nome: searchParams.get('produto_nome') || undefined,
    };

    // Query base para movimentações com join de produtos
    let query = supabase
      .from('estoque_movimentacoes')
      .select(`
        *,
        produto:produtos(*)
      `, { count: 'exact' });

    // Aplicar filtros
    if (filtros.produto_id) {
      query = query.eq('produto_id', filtros.produto_id);
    }

    if (filtros.usuario_id) {
      query = query.eq('usuario_id', filtros.usuario_id);
    }

    if (filtros.tipo_movimentacao) {
      query = query.eq('tipo_movimentacao', filtros.tipo_movimentacao);
    }

    if (filtros.data_inicio) {
      query = query.gte('data_movimentacao', filtros.data_inicio);
    }

    if (filtros.data_fim) {
      // Adicionar 23:59:59 ao final do dia
      const dataFimCompleta = new Date(filtros.data_fim);
      dataFimCompleta.setHours(23, 59, 59, 999);
      query = query.lte('data_movimentacao', dataFimCompleta.toISOString());
    }

    // Filtro por nome do produto (usando inner join)
    if (filtros.produto_nome) {
      query = query.ilike('produto.nome', `%${filtros.produto_nome}%`);
    }

    // Aplicar paginação e ordenação (mais recentes primeiro)
    query = query
      .order('data_movimentacao', { ascending: false })
      .range(offset, offset + pageSize - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Erro ao buscar movimentações:', error);
      return NextResponse.json(
        { error: 'Erro ao buscar histórico de movimentações' },
        { status: 500 }
      );
    }

    const totalPages = Math.ceil((count || 0) / pageSize);

    const response: MovimentacoesListResponse = {
      data: (data as any[]) || [],
      total: count || 0,
      page,
      pageSize,
      totalPages,
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Erro na API de movimentações:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}

// Endpoint para criar movimentação manual (saída, por exemplo)
export async function POST(request: NextRequest) {
  try {
    const { produto_id, tipo_movimentacao, quantidade, observacao } = await request.json();

    // Validações básicas
    if (!produto_id || !tipo_movimentacao || !quantidade) {
      return NextResponse.json(
        { error: 'Produto, tipo de movimentação e quantidade são obrigatórios' },
        { status: 400 }
      );
    }

    if (!['ENTRADA', 'SAIDA'].includes(tipo_movimentacao)) {
      return NextResponse.json(
        { error: 'Tipo de movimentação deve ser ENTRADA ou SAIDA' },
        { status: 400 }
      );
    }

    if (quantidade <= 0) {
      return NextResponse.json(
        { error: 'Quantidade deve ser maior que zero' },
        { status: 400 }
      );
    }

    // Obter usuário autenticado
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Usuário não autorizado' },
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
        { error: 'Produto não encontrado' },
        { status: 404 }
      );
    }

    // Se for saída, verificar se há estoque suficiente
    if (tipo_movimentacao === 'SAIDA') {
      const { data: estoque } = await supabase
        .from('estoque')
        .select('quantidade_atual')
        .eq('produto_id', produto_id)
        .single();

      if (!estoque || estoque.quantidade_atual < quantidade) {
        return NextResponse.json(
          { 
            error: `Quantidade insuficiente em estoque. Disponível: ${estoque?.quantidade_atual || 0}` 
          },
          { status: 400 }
        );
      }
    }

    // Criar movimentação
    const { data: movimentacao, error: movimentacaoError } = await supabase
      .from('estoque_movimentacoes')
      .insert({
        produto_id,
        usuario_id: user.id,
        tipo_movimentacao,
        quantidade,
        observacao: observacao || `${tipo_movimentacao.toLowerCase()} manual - ${produto.nome}`,
      })
      .select(`
        *,
        produto:produtos(*)
      `)
      .single();

    if (movimentacaoError) {
      console.error('Erro ao criar movimentação:', movimentacaoError);
      return NextResponse.json(
        { error: 'Erro ao registrar movimentação' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: `${tipo_movimentacao === 'ENTRADA' ? 'Entrada' : 'Saída'} registrada com sucesso!`,
      data: movimentacao,
    });

  } catch (error) {
    console.error('Erro ao criar movimentação:', error);
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    );
  }
}