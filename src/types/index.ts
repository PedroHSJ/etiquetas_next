export interface UserProfile {
  ativo: boolean;
  created_at: string;
  id: string;
  organizacao: { 
    id: string;
    nome: string,
    tipo: string;
    created_at: string;
  };
  organizacao_id: string;
  perfil: { nome: string; descricao: string };
  perfil_id: string;
  usuario_id: string;
}

export interface UsuarioPermissoes {
  usuario_id: string;
  organizacao_id: string;
  permissoes: any[];
  perfis: any[];
}
