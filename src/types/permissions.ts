export interface Funcionalidade {
  id: string;
  nome: string;
  descricao: string;
  categoria: 'gestao' | 'operacional' | 'relatorios';
  rota: string;
  ativo: boolean;
  created_at: string;
}

export interface PerfilUsuario {
  id: string;
  nome: string;
  descricao: string;
  nivel_acesso: 1 | 2 | 3 | 4; // 1=basico, 2=operacional, 3=gestao, 4=master
  ativo: boolean;
  created_at: string;
}

export interface Permissao {
  id: string;
  funcionalidade_id: string;
  perfil_usuario_id: string;
  acao: 'visualizar' | 'criar' | 'editar' | 'excluir' | 'gerenciar';
  ativo: boolean;
  created_at: string;
  funcionalidade?: Funcionalidade;
  perfil_usuario?: PerfilUsuario;
}

export interface UsuarioPerfil {
  id: string;
  usuario_organizacao_id: string;
  perfil_usuario_id: string;
  ativo: boolean;
  data_inicio: string;
  created_at: string;
  perfil_usuario?: PerfilUsuario;
}

export interface UsuarioPermissoes {
  usuario_id: string;
  organizacao_id: string;
  permissoes: Permissao[];
  perfis: PerfilUsuario[];
}

export interface PermissaoUsuario {
  funcionalidade: string;
  acao: string;
  permitido: boolean;
}

export interface VerificacaoPermissao {
  funcionalidade: string;
  acao: string;
  usuario_id: string;
  organizacao_id: string;
}

export interface ConfiguracaoPerfil {
  perfil_id: string;
  nome: string;
  descricao: string;
  nivel_acesso: number;
  permissoes: {
    funcionalidade_id: string;
    funcionalidade_nome: string;
    acao: string;
    ativo: boolean;
  }[];
}

export interface ConfiguracaoFuncionalidade {
  funcionalidade_id: string;
  nome: string;
  descricao: string;
  categoria: string;
  rota: string;
  permissoes: {
    id: string;
    acao: string;
    descricao: string;
    ativo: boolean;
  }[];
}
