// Tipos para expansão de dados da UAN (Unidade de Alimentação e Nutrição)
import { Estado, Municipio } from "./localidade";

// Definição de tipos básicos
export type TipoUAN =
  | "restaurante_comercial"
  | "restaurante_institucional"
  | "lanchonete"
  | "padaria"
  | "cozinha_industrial"
  | "catering"
  | "outro";

export const ESTADOS_BRASIL = [
  "AC",
  "AL",
  "AP",
  "AM",
  "BA",
  "CE",
  "DF",
  "ES",
  "GO",
  "MA",
  "MT",
  "MS",
  "MG",
  "PA",
  "PB",
  "PR",
  "PE",
  "PI",
  "RJ",
  "RN",
  "RS",
  "RO",
  "RR",
  "SC",
  "SP",
  "SE",
  "TO",
] as const;

export type EstadoBrasil = (typeof ESTADOS_BRASIL)[number];

export interface ResponsavelTecnico {
  nome: string;
  profissao?: string | null;
  registro_profissional?: string | null;
  telefone?: string | null;
  email?: string | null;
}

export interface HorarioFuncionamento {
  segunda?: { abertura: string | null; fechamento: string | null };
  terca?: { abertura: string | null; fechamento: string | null };
  quarta?: { abertura: string | null; fechamento: string | null };
  quinta?: { abertura: string | null; fechamento: string | null };
  sexta?: { abertura: string | null; fechamento: string | null };
  sabado?: { abertura: string | null; fechamento: string | null };
  domingo?: { abertura: string | null; fechamento: string | null };
}

export interface OrganizacaoExpandida {
  // Campos existentes
  id: string;
  nome: string;
  tipo?: string;
  user_id: string;
  created_at: string;

  // Novos campos - Informações Básicas
  cnpj?: string | null;
  tipo_uan?: TipoUAN | null;
  capacidade_atendimento?: number | null;
  data_inauguracao?: string | null;
  descricao?: string | null;

  // Campos de localização - Novos (com referências)
  estado_id?: number | null;
  municipio_id?: number | null;
  cep?: string | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  bairro?: string | null;

  // Campos de localização - Antigos (para compatibilidade)
  endereco_completo?: string | null;
  cidade?: string | null;
  estado?: EstadoBrasil | null;
  latitude?: number | null;
  longitude?: number | null;
  telefone_principal?: string | null;
  telefone_secundario?: string | null;
  email?: string | null;

  updated_at?: string | null;

  // Relacionamentos
  estado_rel?: Estado;
  municipio_rel?: Municipio;
  responsavel_tecnico?: ResponsavelTecnico | null;
  horario_funcionamento?: HorarioFuncionamento | null;
}

// Tipos para formulários
export interface OrganizacaoFormData {
  // Informações Básicas
  nome: string;
  cnpj?: string;
  tipo_uan?: TipoUAN;
  capacidade_atendimento?: number;
  data_inauguracao?: string;
  descricao?: string;

  // Localização - Novos campos
  estado_id?: number;
  municipio_id?: number;
  cep?: string;
  endereco?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;

  // Localização - Campos antigos (compatibilidade)
  endereco_completo?: string;
  cidade?: string;
  estado?: EstadoBrasil;
  latitude?: number;
  longitude?: number;
  telefone_principal?: string;
  telefone_secundario?: string;
  email?: string;
}

// Constantes para uso nos componentes
export const TIPOS_UAN: Record<TipoUAN, string> = {
  restaurante_comercial: "Restaurante Comercial",
  restaurante_institucional: "Restaurante Institucional",
  lanchonete: "Lanchonete",
  padaria: "Padaria",
  cozinha_industrial: "Cozinha Industrial",
  catering: "Catering",
  outro: "Outro",
};

export const DIAS_SEMANA: Record<string, string> = {
  segunda: "Segunda-feira",
  terca: "Terça-feira",
  quarta: "Quarta-feira",
  quinta: "Quinta-feira",
  sexta: "Sexta-feira",
  sabado: "Sábado",
  domingo: "Domingo",
};

// Utilidades para validação
export function isValidTipoUAN(tipo: string): tipo is TipoUAN {
  return Object.keys(TIPOS_UAN).includes(tipo as TipoUAN);
}

export function isValidEstado(estado: string): estado is EstadoBrasil {
  return ESTADOS_BRASIL.includes(estado as EstadoBrasil);
}
