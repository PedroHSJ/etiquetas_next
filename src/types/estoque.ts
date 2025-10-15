// =============================================================================
// TIPOS DE ESTOQUE E MOVIMENTAÇÕES
// =============================================================================

import { Product } from './products';

// Tipo para movimentação de estoque
export type TipoMovimentacao = 'ENTRADA' | 'SAIDA';

// Interface principal do estoque
export interface Estoque {
  id: string;
  produto_id: number;
  quantidade_atual: number;
  usuario_id: string;
  created_at: string;
  updated_at: string;

  // Dados relacionados (joins)
  produto?: Product;
  usuario?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

// Interface para movimentações de estoque
export interface EstoqueMovimentacao {
  id: string;
  produto_id: number;
  usuario_id: string;
  tipo_movimentacao: TipoMovimentacao;
  quantidade: number;
  observacao?: string;
  data_movimentacao: string;
  created_at: string;

  // Dados relacionados (joins)
  produto?: Product;
  usuario?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
}

// DTO para entrada rápida de estoque
export interface EntradaRapidaRequest {
  produto_id: number;
  quantidade: number;
  observacao?: string;
}

// DTO para resposta de entrada rápida
export interface EntradaRapidaResponse {
  success: boolean;
  message: string;
  movimentacao?: EstoqueMovimentacao;
  estoque_atualizado?: Estoque;
}

// Filtros para listagem de estoque
export interface EstoqueFiltros {
  produto_nome?: string;
  produto_id?: number;
  usuario_id?: string;
  estoque_zerado?: boolean;
  estoque_baixo?: boolean;
  quantidade_minima?: number;
}

// Filtros para movimentações
export interface MovimentacoesFiltros {
  produto_id?: number;
  usuario_id?: string;
  tipo_movimentacao?: TipoMovimentacao;
  data_inicio?: string;
  data_fim?: string;
  produto_nome?: string;
}

// Interface para listagem paginada de estoque
export interface EstoqueListResponse {
  data: Estoque[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interface para listagem paginada de movimentações
export interface MovimentacoesListResponse {
  data: EstoqueMovimentacao[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Estatísticas do estoque (para dashboard)
export interface EstoqueEstatisticas {
  total_produtos: number;
  produtos_em_estoque: number;
  produtos_zerados: number;
  produtos_baixo_estoque: number;
  valor_total_estimado?: number;
  ultima_atualizacao: string;
}

// Interface para dados do dashboard de estoque
export interface EstoqueDashboard {
  estatisticas: EstoqueEstatisticas;
  produtos_zerados: Estoque[];
  produtos_baixo_estoque: Estoque[];
  ultimas_movimentacoes: EstoqueMovimentacao[];
}

// Interface para seleção de produto na entrada rápida
export interface ProdutoSelect {
  id: number;
  nome: string;
  grupo_id?: number;
  unidade_medida?: string;
  estoque_atual?: number;
}

// Constantes para tipos de movimentação
export const TIPOS_MOVIMENTACAO = [
  { value: 'ENTRADA', label: 'Entrada' },
  { value: 'SAIDA', label: 'Saída' },
] as const;

// Validação de quantidade
export const QUANTIDADE_VALIDATION = {
  min: 0.001,
  max: 999999.999,
  step: 0.001,
} as const;

// Mensagens padrão
export const ESTOQUE_MESSAGES = {
  ENTRADA_SUCESSO: '✅ Entrada registrada com sucesso!',
  SAIDA_SUCESSO: '✅ Saída registrada com sucesso!',
  ERRO_QUANTIDADE_INSUFICIENTE: 'Quantidade insuficiente em estoque',
  ERRO_PRODUTO_NAO_ENCONTRADO: 'Produto não encontrado',
  ERRO_QUANTIDADE_INVALIDA: 'Quantidade deve ser maior que zero',
  ERRO_USUARIO_NAO_AUTORIZADO: 'Usuário não autorizado',
} as const;

// Configurações de paginação padrão
export const ESTOQUE_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;