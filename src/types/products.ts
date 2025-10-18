export interface Product {
  id: number;
  group_id: number;
  name: string;
  // Dados relacionados (joins)
  group?: ProductGroup;
}

export interface ProductGroup {
  id: number;
  name: string;
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