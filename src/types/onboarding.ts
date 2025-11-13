import { Profile } from "./models/profile";

export interface Convite {
  id: string;
  email: string;
  organization_id: string;
  profile_id: string;
  status: "pendente" | "aceito" | "expirado" | "rejeitado" | "cancelado";
  token_invite: string;
  expira_em: string;
  convidado_por: string;
  created_at: string;
  aceito_em?: string;
  aceito_por?: string;
  rejeitado_em?: string;
  rejeitado_por?: string;
  // Campos relacionados
  organizacao?: {
    name: string;
    type: string;
  };
  perfil?: Profile;
  convidado_por_usuario?: {
    id: string;
    nome: string;
    email: string;
  };
}

export interface UsuarioOrganizacao {
  id: string;
  user_id: string;
  organization_id: string;
  profile_id: string;
  active: boolean;
  entry_date: string;
  exit_date?: string;
  created_at: string;
  // Campos relacionados
  organizacao?: {
    name: string;
    type: string;
  };
  perfil?: Profile;
}

export interface OnboardingChoice {
  tipo: "gestor" | "funcionario";
  perfil?: "cozinheiro" | "estoquista";
}
