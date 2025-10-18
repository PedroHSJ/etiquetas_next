import { Estado, Municipio } from "./localidade";

export interface OrganizationType {
  id: string;
  nome: string;
  tipo: "uan";
  created_at: string;
  // Novos campos de localização
  estado_id?: number;
  municipio_id?: number;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  // Relacionamentos
  estado?: Estado;
  municipio?: Municipio;
  // Removido user_id pois agora usamos usuarios_organizacoes
  user_perfil?: {
    nome: string;
    descricao: string;
  };
  data_entrada?: string;
}

export interface OrganizationTemplate {
  departamentos: Array<{
    nome: string;
    tipo: string;
  }>;
  especializacoes: Record<string, string[]>;
  terminologia: {
    organizacao: string;
    departamento: string;
    especializacao: string;
    integrante: string;
  };
}
