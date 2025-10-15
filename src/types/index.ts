// =============================================================================
// ÍNDICE CENTRAL DE TIPOS - RE-EXPORTAÇÕES
// =============================================================================

// Tipos de localidade (estados e municípios)
export * from './localidade'

// Tipos de etiquetas e sistema de impressão
export * from './etiquetas'

// Tipos de produtos e categorias
export * from './products'

// Tipos de estoque e movimentações
export * from './estoque'

// Tipos de organizações e templates
export * from './organization'

// Tipos de permissões e perfis
export * from './permissions'

// Tipos de onboarding e convites
export * from './onboarding'

// Tipos de tabelas genéricas
export * from './table'

// Tipos de UAN (Unidade de Alimentação e Nutrição)
export * from './uan'

// Tipos de componentes e contextos
export * from './components'

// =============================================================================
// TIPOS GLOBAIS DE USUÁRIO (não duplicados em outros arquivos)
// =============================================================================

export interface UserProfile {
  ativo: boolean;
  created_at: string;
  id: string;
  organizacao: { 
    id: string;
    nome: string,
    tipo: string;
    created_at: string;
  };
  organizacao_id: string;
  perfil: { nome: string; descricao: string };
  perfil_id: string;
  usuario_id: string;
}
