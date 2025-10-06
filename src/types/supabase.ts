/**
 * Tipos de dados retornados pelo Supabase
 * Interfaces para tipificar os retornos das consultas ao banco de dados
 */

// =============================================================================
// TIPOS PARA PRODUTOS (tabela produtos)
// =============================================================================

export interface SupabaseProduto {
  id: number;
  nome: string;
  descricao?: string;
  grupo_id?: number;
  created_at?: string;
  updated_at?: string;
  // Relacionamento com grupos (pode ser objeto ou array dependendo da query)
  grupos?: SupabaseGrupo | SupabaseGrupo[] | { nome: string };
}

export interface SupabaseGrupo {
  id?: number;
  nome: string;
  descricao?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipo específico para queries de busca de produtos
export interface SupabaseProdutoSearch {
  id: number;
  nome: string;
  grupos?: { nome: string } | null;
}

// =============================================================================
// TIPOS PARA ORGANIZAÇÃO (tabela organizacoes)
// =============================================================================

export interface SupabaseOrganizacao {
  id: string;
  nome: string;
  cnpj?: string;
  telefone?: string;
  email?: string;
  endereco?: string;
  cidade?: string;
  estado?: string;
  cep?: string;
  tipo_uan?: string;
  capacidade_pessoas?: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
}

// =============================================================================
// TIPOS GENÉRICOS PARA PARÂMETROS DE FUNÇÕES
// =============================================================================

export interface ParseError extends Error {
  message: string;
  name: string;
  stack?: string;
}

export interface UnknownError {
  [key: string]: unknown;
}

// =============================================================================
// TIPOS PARA INGREDIENTES NAS QUERIES
// =============================================================================

export interface IngredientResponse {
  name: string;
  quantity: string | number;
  unit: string;
}

export interface RawIngredientData {
  name?: unknown;
  quantity?: unknown;
  unit?: unknown;
}