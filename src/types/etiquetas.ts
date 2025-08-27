export interface Etiqueta {
  id: number;
  produto_id: number;
  grupo_id: number;
  quantidade: number;
  data_impressao: string;
  usuario_id: string;
  organizacao_id: string;
  status: string;
  observacoes?: string;
  created_at: string;
  produtos: { nome: string };
  grupos: { nome: string };
}

export interface EtiquetaCreate {
  produto_id: number;
  grupo_id: number;
  quantidade: number;
  observacoes?: string;
}

export interface Grupo {
  id: number;
  nome: string;
  descricao?: string;
}

export interface Produto {
  id: number;
  nome: string;
  grupo_id: number;
}
