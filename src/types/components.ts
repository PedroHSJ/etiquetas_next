// Tipo de usuário do Supabase
export interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
  created_at?: string;
}

export interface Organization {
  id: string;
  nome: string;
  tipo?: string | null;
  userId?: string | null;
  createdAt?: string | null;
  cnpj?: string | null;
  tipoUan?: string | null;
  capacidadeAtendimento?: number | null;
  dataInauguracao?: string | null;
  enderecoCompleto?: string | null;
  cep?: string | null;
  bairro?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  telefonePrincipal?: string | null;
  telefoneAlternativo?: string | null;
  emailInstitucional?: string | null;
  updatedAt?: string | null;
  estadoId?: number | null;
  municipioId?: number | null;
  endereco?: string | null;
  numero?: string | null;
  complemento?: string | null;
  descricao?: string | null;
  cidade?: string | null;
  estado?: string | null;
  telefoneSecundario?: string | null;
  email?: string | null;
  // Campos do banco em snake_case para compatibilidade
  user_id?: string | null;
  created_at?: string | null;
  tipo_uan?: string | null;
  capacidade_atendimento?: number | null;
  data_inauguracao?: string | null;
  endereco_completo?: string | null;
  telefone_principal?: string | null;
  telefone_alternativo?: string | null;
  email_institucional?: string | null;
  updated_at?: string | null;
  estado_id?: number | null;
  municipio_id?: number | null;
  telefone_secundario?: string | null;
  // Index signature para permitir campos dinâmicos
  [key: string]: string | number | null | undefined;
}