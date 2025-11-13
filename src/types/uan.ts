// Tipos específicos para UAN (Unidade de Alimentação e Nutrição)
// Para a interface Organization completa, veja @/types/organization

// Definição de tipos de UAN
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

/**
 * Dados do responsável técnico da UAN
 */
export interface ResponsavelTecnico {
  nome: string;
  profissao?: string | null;
  registro_profissional?: string | null;
  telefone?: string | null;
  email?: string | null;
}

/**
 * Horário de funcionamento da UAN por dia da semana
 */
export interface HorarioFuncionamento {
  segunda?: { abertura: string | null; fechamento: string | null };
  terca?: { abertura: string | null; fechamento: string | null };
  quarta?: { abertura: string | null; fechamento: string | null };
  quinta?: { abertura: string | null; fechamento: string | null };
  sexta?: { abertura: string | null; fechamento: string | null };
  sabado?: { abertura: string | null; fechamento: string | null };
  domingo?: { abertura: string | null; fechamento: string | null };
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
