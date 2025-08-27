export interface UserProfile {
  id: string;
  usuario_id: string;
  organizacao_id: string;
  perfil: string;
  organizacao_nome: string;
  ativo: boolean;
  created_at: string;
}

export interface UsuarioPermissoes {
  usuario_id: string;
  organizacao_id: string;
  permissoes: any[];
  perfis: any[];
}
