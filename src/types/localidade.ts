// Tipos para Estados e Municípios

export interface Estado {
  id: number;
  codigo: string; // UF (SP, RJ, etc.)
  nome: string;
  regiao: string;
  created_at: string;
}

export interface Municipio {
  id: number;
  estado_id: number;
  codigo_ibge?: string | null;
  nome: string;
  cep_inicial?: string | null;
  cep_final?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  created_at: string;
  updated_at: string;
  // Relacionamento
  estado?: Estado;
}

// Response da API ViaCEP
export interface ViaCEPResponse {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string; // cidade
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean; // true quando CEP não encontrado
}

// Dados processados para criação/atualização de município
export interface DadosMunicipio {
  nome: string;
  uf: string;
  codigo_ibge?: string;
  cep?: string;
  latitude?: number;
  longitude?: number;
}

// Para formulários que usam seleção de localidade
export interface LocalidadeFormData {
  estado_id?: number;
  municipio_id?: number;
  cep?: string;
  endereco_completo?: string;
  bairro?: string;
}

// Response da busca/criação de município
export interface MunicipioResponse {
  id: number;
  nome: string;
  estado: {
    id: number;
    codigo: string;
    nome: string;
  };
}
