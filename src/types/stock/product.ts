// =============================================================================
// TIPOS DE PRODUTOS E GRUPOS
// =============================================================================

/**
 * Produto conforme schema do banco de dados
 * Tabela: public.products
 */
export interface Product {
  id: number;
  name: string;
  group_id?: number | null;
  
  // Dados relacionados (joins)
  group?: ProductGroup;
}

/**
 * Grupo de produtos para classificação
 * Tabela: public.groups
 */
export interface ProductGroup {
  id: number;
  name: string;
  description?: string | null;
}

export const UNIT_OF_MEASURE_OPTIONS = [
  { value: "kg", label: "Quilograma (kg)" },
  { value: "g", label: "Grama (g)" },
  { value: "L", label: "Litro (L)" },
  { value: "mL", label: "Mililitro (mL)" },
  { value: "un", label: "Unidade (un)" },
  { value: "cx", label: "Caixa (cx)" },
  { value: "pct", label: "Pacote (pct)" },
] as const;
