export interface Product {
  id: string;
  organization_id: string;
  category_id?: string;
  name: string;
  description?: string;
  brand?: string;
  supplier?: string;
  barcode?: string;
  internal_code?: string;
  shelf_life_days?: number; // Validade em dias
  storage_temperature?: string;
  allergens?: string[];
  ingredients?: string[];
  nutritional_info?: {
    calories_per_100g?: number;
    protein_per_100g?: number;
    carbs_per_100g?: number;
    fat_per_100g?: number;
    fiber_per_100g?: number;
    sodium_per_100g?: number;
  };
  haccp_notes?: string;
  is_active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;

  // Dados relacionados (joins)
  category?: ProductCategory;
}

export interface ProductCategory {
  id: string;
  organization_id: string;
  name: string;
  description?: string;
  color: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
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

export const DEFAULT_CATEGORIES = [
  { name: "Carnes e Aves", color: "#ef4444" },
  { name: "Peixes e Frutos do Mar", color: "#3b82f6" },
  { name: "Laticínios", color: "#f59e0b" },
  { name: "Vegetais e Legumes", color: "#10b981" },
  { name: "Frutas", color: "#f97316" },
  { name: "Grãos e Cereais", color: "#8b5cf6" },
  { name: "Temperos e Condimentos", color: "#84cc16" },
  { name: "Bebidas", color: "#06b6d4" },
  { name: "Produtos Processados", color: "#6b7280" },
  { name: "Outros", color: "#64748b" },
] as const;
