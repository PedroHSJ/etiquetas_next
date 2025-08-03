export enum LabelType {
  PRODUTO_ABERTO = 'PRODUTO_ABERTO',
  MANIPULADO = 'MANIPULADO',
  DESCONGELO = 'DESCONGELO',
  AMOSTRA = 'AMOSTRA',
  BRANCO = 'BRANCO'
}

export interface Label {
  id: string;
  type: LabelType;
  product_name?: string;
  responsible?: string;
  opening_date?: string;
  manipulation_date?: string;
  thaw_date?: string;
  sample_date?: string;
  expiry_date?: string;
  temperature?: string;
  lot?: string;
  notes?: string;
  organization_id: string;
  department_id?: string;
  created_at: string;
  updated_at: string;
}

export interface LabelField {
  id: string;
  type: 'text' | 'date' | 'temperature' | 'qrcode' | 'barcode';
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
    fontWeight: 'normal' | 'bold';
    textAlign: 'left' | 'center' | 'right';
    color: string;
    backgroundColor?: string;
    borderStyle?: 'none' | 'solid' | 'dashed';
    borderWidth?: number;
    borderColor?: string;
  };
}

export interface LabelTemplate {
  id: string;
  name: string;
  label_type: LabelType;
  paper_size: 'A4' | 'CUSTOM';
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
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface PrintLayout {
  id: string;
  template_id: string;
  name: string;
  paper_size: 'A4' | 'CUSTOM';
  orientation: 'portrait' | 'landscape';
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
    name: 'Produto Aberto',
    color: '#ef4444',
    defaultFields: [
      { type: 'text', label: 'Produto', required: true },
      { type: 'date', label: 'Data de Abertura', required: true },
      { type: 'date', label: 'Validade', required: true },
      { type: 'text', label: 'Responsável', required: false },
      { type: 'temperature', label: 'Temperatura', required: false },
      { type: 'text', label: 'Lote', required: false }
    ]
  },
  [LabelType.MANIPULADO]: {
    name: 'Manipulado',
    color: '#f59e0b',
    defaultFields: [
      { type: 'text', label: 'Produto', required: true },
      { type: 'date', label: 'Data de Manipulação', required: true },
      { type: 'date', label: 'Validade', required: true },
      { type: 'text', label: 'Responsável', required: true },
      { type: 'temperature', label: 'Temperatura', required: false },
      { type: 'text', label: 'Observações', required: false }
    ]
  },
  [LabelType.DESCONGELO]: {
    name: 'Descongelado',
    color: '#3b82f6',
    defaultFields: [
      { type: 'text', label: 'Produto', required: true },
      { type: 'date', label: 'Data de Descongelamento', required: true },
      { type: 'date', label: 'Validade', required: true },
      { type: 'text', label: 'Responsável', required: true },
      { type: 'temperature', label: 'Temperatura', required: false },
      { type: 'text', label: 'Lote', required: false }
    ]
  },
  [LabelType.AMOSTRA]: {
    name: 'Amostra',
    color: '#10b981',
    defaultFields: [
      { type: 'text', label: 'Produto', required: true },
      { type: 'date', label: 'Data da Amostra', required: true },
      { type: 'text', label: 'Responsável', required: true },
      { type: 'text', label: 'Lote', required: false },
      { type: 'text', label: 'Observações', required: false }
    ]
  },
  [LabelType.BRANCO]: {
    name: 'Etiqueta em Branco',
    color: '#6b7280',
    defaultFields: []
  }
};
