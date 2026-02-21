/**
 * Tipos de dados retornados pelo Supabase
 * Interfaces para tipificar os retornos das consultas ao banco de dados
 */

// =============================================================================
// TIPOS PARA PRODUTOS (tabela products - migrada de produtos)
// =============================================================================

export interface SupabaseProduct {
  id: number;
  name: string;
  description?: string;
  group_id?: number;
  created_at?: string;
  updated_at?: string;
  // Relacionamento com groups (pode ser objeto ou array dependendo da query)
  groups?: SupabaseGroup | SupabaseGroup[] | { name: string };
}

export interface SupabaseGroup {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  updated_at?: string;
}

// Tipo específico para queries de busca de produtos
export interface SupabaseProductSearch {
  id: number;
  name: string;
  groups?: { name: string } | null;
}

// =============================================================================
// BACKWARD COMPATIBILITY - Will be removed after full migration
// =============================================================================

/** @deprecated Use SupabaseProduct instead */
export type SupabaseProduto = SupabaseProduct;

/** @deprecated Use SupabaseGroup instead */
export type SupabaseGrupo = SupabaseGroup;

/** @deprecated Use SupabaseProductSearch instead */
export type SupabaseProdutoSearch = SupabaseProductSearch;

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
