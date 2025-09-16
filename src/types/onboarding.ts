export interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  created_at: string;
}

export interface Convite {
  id: string;
  email: string;
  organizacao_id: string;
  perfil_id: string;
  status: 'pendente' | 'aceito' | 'expirado';
  token_invite: string;
  expira_em: string;
  convidado_por: string;
  created_at: string;
  aceito_em?: string;
  aceito_por?: string;
  // Campos relacionados
  organizacao?: {
    nome: string;
    tipo: string;
  };
  perfil?: Perfil;
  convidado_por_usuario?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface UsuarioOrganizacao {
  id: string;
  usuario_id: string;
  organizacao_id: string;
  perfil_id: string;
  ativo: boolean;
  data_entrada: string;
  data_saida?: string;
  created_at: string;
  // Campos relacionados
  organizacao?: {
    nome: string;
    tipo: string;
  };
  perfil?: Perfil;
}

export interface OnboardingChoice {
  tipo: 'gestor' | 'funcionario';
  perfil?: 'cozinheiro' | 'estoquista';
}
