// =============================================================================
// TIPOS DE ETIQUETAS E SISTEMA DE IMPRESSÃO
// =============================================================================

export enum LabelType {
  PRODUTO_ABERTO = "PRODUTO_ABERTO",
  MANIPULADO = "MANIPULADO",
  DESCONGELO = "DESCONGELO",
  AMOSTRA = "AMOSTRA",
  BRANCO = "BRANCO",
}

export interface Label {
  id: string;
  organization_id: string;
  department_id?: string;
  template_id: string;
  product_id?: string;
  label_type: LabelType;

  // Dados do produto (podem ser diferentes do cadastro original)
  product_name?: string;
  product_brand?: string;
  quantity?: number;
  unit_of_measure?: string;

  // Dados específicos por tipo de etiqueta
  responsible?: string;
  opening_date?: string;
  manipulation_date?: string;
  thaw_date?: string;
  sample_date?: string;
  expiry_date?: string;

  // Dados adicionais
  temperature?: string;
  lot?: string;
  batch?: string;
  notes?: string;

  // Campos customizáveis em JSON
  custom_fields?: Record<string, unknown>;

  // Rastreabilidade
  printed_at?: string;
  print_count: number;
  qr_code?: string;

  created_by: string;
  created_at: string;
  updated_at: string;

  // Dados relacionados (joins)
  template?: LabelTemplate;
  product?: {
    id: string;
    name: string;
    category?: string;
  };
}

export interface LabelField {
  id: string;
  type:
    | "text"
    | "date"
    | "temperature"
    | "qrcode"
    | "barcode"
    | "product"
    | "quantity"
    | "label-type";
  label: string;
  value?: string;
  position: {
    x: number;
    y: number;
  };
  size: {
    width: number;
    height: number;
  };
  style: {
    fontSize: number;
    fontWeight: "normal" | "bold";
    textAlign: "left" | "center" | "right";
    color: string;
    backgroundColor?: string;
    borderStyle?: "none" | "solid" | "dashed";
    borderWidth?: number;
    borderColor?: string;
  };
  // Propriedades específicas para campos especiais
  selectedProduct?: {
    id: string;
    name: string;
  };
  quantity?: string;
  unitOfMeasure?: string;
  labelType?: string;
}

export interface LabelTemplate {
  id: string;
  organization_id: string;
  name: string;
  label_type: LabelType;
  paper_size: "A4" | "CUSTOM";
  custom_width?: number;
  custom_height?: number;
  labels_per_row: number;
  labels_per_column: number;
  label_width: number;
  label_height: number;
  margin_top: number;
  margin_bottom: number;
  margin_left: number;
  margin_right: number;
  gap_horizontal: number;
  gap_vertical: number;
  fields: LabelField[];
  is_default: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PrintLayout {
  id: string;
  template_id: string;
  name: string;
  paper_size: "A4" | "CUSTOM";
  orientation: "portrait" | "landscape";
  custom_width?: number;
  custom_height?: number;
  labels_per_page: number;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export const LABEL_TYPES_CONFIG = {
  [LabelType.PRODUTO_ABERTO]: {
    name: "Produto Aberto",
    color: "#ef4444",
    defaultFields: [
      { type: "label-type", label: "Tipo da Etiqueta", required: true },
      { type: "product", label: "Produto", required: true },
      { type: "quantity", label: "Quantidade", required: true },
      { type: "date", label: "Data de Abertura", required: true },
      { type: "date", label: "Validade", required: true },
      { type: "text", label: "Responsável", required: false },
      { type: "temperature", label: "Temperatura", required: false },
      { type: "text", label: "Lote", required: false },
    ],
  },
  [LabelType.MANIPULADO]: {
    name: "Manipulado",
    color: "#f59e0b",
    defaultFields: [
      { type: "label-type", label: "Tipo da Etiqueta", required: true },
      { type: "product", label: "Produto", required: true },
      { type: "quantity", label: "Quantidade", required: true },
      { type: "date", label: "Data de Manipulação", required: true },
      { type: "date", label: "Validade", required: true },
      { type: "text", label: "Responsável", required: true },
      { type: "temperature", label: "Temperatura", required: false },
      { type: "text", label: "Observações", required: false },
    ],
  },
  [LabelType.DESCONGELO]: {
    name: "Descongelado",
    color: "#3b82f6",
    defaultFields: [
      { type: "label-type", label: "Tipo da Etiqueta", required: true },
      { type: "product", label: "Produto", required: true },
      { type: "quantity", label: "Quantidade", required: true },
      { type: "date", label: "Data de Descongelamento", required: true },
      { type: "date", label: "Validade", required: true },
      { type: "text", label: "Responsável", required: true },
      { type: "temperature", label: "Temperatura", required: false },
      { type: "text", label: "Lote", required: false },
    ],
  },
  [LabelType.AMOSTRA]: {
    name: "Amostra",
    color: "#10b981",
    defaultFields: [
      { type: "label-type", label: "Tipo da Etiqueta", required: true },
      { type: "product", label: "Produto", required: true },
      { type: "quantity", label: "Quantidade", required: true },
      { type: "date", label: "Data da Amostra", required: true },
      { type: "text", label: "Responsável", required: true },
      { type: "text", label: "Lote", required: false },
      { type: "text", label: "Observações", required: false },
    ],
  },
  [LabelType.BRANCO]: {
    name: "Etiqueta em Branco",
    color: "#6b7280",
    defaultFields: [],
  },
};

// =============================================================================
// TIPOS LEGADOS (para compatibilidade com sistema antigo)
// =============================================================================

export interface Etiqueta {
  id: number;
  product_id: number;
  grupo_id: number;
  quantidade: number;
  data_impressao: string;
  user_id: string;
  organizacao_id: string;
  status: string;
  observacoes?: string;
  created_at: string;
  products: { name: string };
  groups: { name: string };
  // Deprecated - backward compatibility
  produto_id?: number;
  usuario_id?: string;
  product?: { name: string };
  produto?: { nome: string };
  produtos?: { nome: string };
  grupos?: { nome: string };
}

export interface EtiquetaCreate {
  product_id: number;
  grupo_id: number;
  quantidade: number;
  observacoes?: string;
  // Deprecated - backward compatibility
  produto_id?: number;
}

export interface Grupo {
  id: number;
  name: string;
  description?: string;
  // Deprecated - backward compatibility
  nome?: string;
  descricao?: string;
}

export interface Produto {
  id: number;
  name: string;
  group_id: number;
  // Deprecated - backward compatibility
  nome?: string;
  grupo_id?: number;
}
