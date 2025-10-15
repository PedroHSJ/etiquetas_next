import { useState, useCallback } from 'react';
import { 
  Estoque, 
  EstoqueMovimentacao, 
  EntradaRapidaRequest, 
  EstoqueFiltros,
  MovimentacoesFiltros,
  EstoqueListResponse,
  MovimentacoesListResponse,
  ProdutoSelect 
} from '@/types/estoque';
import { toast } from 'sonner';

export function useEstoque() {
  const [carregandoEstoque, setCarregandoEstoque] = useState(false);
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] = useState(false);
  const [carregandoProdutos, setCarregandoProdutos] = useState(false);

  // Buscar lista de estoque
  const buscarEstoque = useCallback(async (
    filtros: EstoqueFiltros = {},
    page = 1,
    pageSize = 20
  ): Promise<EstoqueListResponse | null> => {
    setCarregandoEstoque(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      // Adicionar filtros
      if (filtros.produto_nome) params.append('produto_nome', filtros.produto_nome);
      if (filtros.produto_id) params.append('produto_id', filtros.produto_id.toString());
      if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
      if (filtros.estoque_zerado) params.append('estoque_zerado', 'true');
      if (filtros.estoque_baixo) params.append('estoque_baixo', 'true');
      if (filtros.quantidade_minima) params.append('quantidade_minima', filtros.quantidade_minima.toString());

      const response = await fetch(`/api/estoque?${params}`);
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        toast.error(data.error || 'Erro ao buscar estoque');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar estoque:', error);
      toast.error('Erro ao buscar estoque');
      return null;
    } finally {
      setCarregandoEstoque(false);
    }
  }, []);

  // Buscar movimentações
  const buscarMovimentacoes = useCallback(async (
    filtros: MovimentacoesFiltros = {},
    page = 1,
    pageSize = 20
  ): Promise<MovimentacoesListResponse | null> => {
    setCarregandoMovimentacoes(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        pageSize: pageSize.toString(),
      });

      // Adicionar filtros
      if (filtros.produto_id) params.append('produto_id', filtros.produto_id.toString());
      if (filtros.usuario_id) params.append('usuario_id', filtros.usuario_id);
      if (filtros.tipo_movimentacao) params.append('tipo_movimentacao', filtros.tipo_movimentacao);
      if (filtros.data_inicio) params.append('data_inicio', filtros.data_inicio);
      if (filtros.data_fim) params.append('data_fim', filtros.data_fim);
      if (filtros.produto_nome) params.append('produto_nome', filtros.produto_nome);

      const response = await fetch(`/api/estoque/movimentacoes?${params}`);
      const data = await response.json();

      if (response.ok) {
        return data;
      } else {
        toast.error(data.error || 'Erro ao buscar movimentações');
        return null;
      }
    } catch (error) {
      console.error('Erro ao buscar movimentações:', error);
      toast.error('Erro ao buscar movimentações');
      return null;
    } finally {
      setCarregandoMovimentacoes(false);
    }
  }, []);

  // Buscar produtos para seleção
  const buscarProdutos = useCallback(async (
    termo = '',
    limit = 50
  ): Promise<ProdutoSelect[]> => {
    setCarregandoProdutos(true);
    try {
      const params = new URLSearchParams({
        limit: limit.toString(),
      });

      if (termo) params.append('q', termo);

      const response = await fetch(`/api/estoque/produtos?${params}`);
      const data = await response.json();

      if (response.ok && data.success) {
        return data.data;
      } else {
        toast.error(data.error || 'Erro ao buscar produtos');
        return [];
      }
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      toast.error('Erro ao buscar produtos');
      return [];
    } finally {
      setCarregandoProdutos(false);
    }
  }, []);

  // Realizar entrada rápida
  const entradaRapida = useCallback(async (
    request: EntradaRapidaRequest
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/estoque/entrada-rapida', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        return true;
      } else {
        toast.error(result.message || 'Erro ao registrar entrada');
        return false;
      }
    } catch (error) {
      console.error('Erro ao registrar entrada:', error);
      toast.error('Erro ao registrar entrada');
      return false;
    }
  }, []);

  // Criar movimentação manual
  const criarMovimentacao = useCallback(async (
    produto_id: number,
    tipo_movimentacao: 'ENTRADA' | 'SAIDA',
    quantidade: number,
    observacao?: string
  ): Promise<boolean> => {
    try {
      const response = await fetch('/api/estoque/movimentacoes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          produto_id,
          tipo_movimentacao,
          quantidade,
          observacao,
        }),
      });

      const result = await response.json();

      if (result.success) {
        toast.success(result.message);
        return true;
      } else {
        toast.error(result.error || 'Erro ao registrar movimentação');
        return false;
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      toast.error('Erro ao registrar movimentação');
      return false;
    }
  }, []);

  return {
    // Estados de carregamento
    carregandoEstoque,
    carregandoMovimentacoes,
    carregandoProdutos,
    
    // Funções de busca
    buscarEstoque,
    buscarMovimentacoes,
    buscarProdutos,
    
    // Funções de ação
    entradaRapida,
    criarMovimentacao,
  };
}