// =============================================================================
// TIPOS DE ESTOQUE E MOVIMENTAÇÕES
// =============================================================================

import { Product } from "./stock/product";

// Tipo para movimentação de estoque
export type TipoMovimentacao = "ENTRADA" | "SAIDA";

// Interface principal do estoque
export interface Estoque {
  id: string;
  productId: number;
  current_quantity: number;
  userId: string;
  created_at: string;
  updated_at: string;

  // Dados relacionados (joins)
  product?: Product;
  user?: {
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
  productId: number;
  userId: string;
  movement_type: TipoMovimentacao;
  quantity: number;
  observation?: string;
  movement_date: string;
  created_at: string;

  // Dados relacionados (joins)
  product?: Product;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };
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
  productId?: number;
  userId?: string;
  estoque_zerado?: boolean;
  estoque_baixo?: boolean;
  quantidade_minima?: number;
}

// Filtros para movimentações
export interface MovimentacoesFiltros {
  productId?: number;
  userId?: string;
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
  { value: "ENTRADA", label: "Entrada" },
  { value: "SAIDA", label: "Saída" },
] as const;

// Validação de quantidade
export const QUANTIDADE_VALIDATION = {
  min: 0.001,
  max: 999999.999,
  step: 0.001,
} as const;

// Mensagens padrão
export const ESTOQUE_MESSAGES = {
  ENTRADA_SUCESSO: "✅ Entrada registrada com sucesso!",
  SAIDA_SUCESSO: "✅ Saída registrada com sucesso!",
  ERRO_QUANTIDADE_INSUFICIENTE: "Quantidade insuficiente em estoque",
  ERRO_PRODUTO_NAO_ENCONTRADO: "Produto não encontrado",
  ERRO_QUANTIDADE_INVALIDA: "Quantidade deve ser maior que zero",
  ERRO_USUARIO_NAO_AUTORIZADO: "Usuário não autorizado",
} as const;

// Configurações de paginação padrão
export const ESTOQUE_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
