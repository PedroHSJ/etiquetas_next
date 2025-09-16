export interface Funcionalidade {
  id: string;
  nome: string;
  descricao: string;
  categoria: "gestao" | "operacional" | "relatorios";
  rota: string;
  ativo: boolean;
  created_at: string;
}

export interface Perfil {
  id: string;
  nome: string;
  descricao: string;
  ativo: boolean;
  created_at: string;
}

export interface Permissao {
  id: string;
  funcionalidade_id: string;
  perfil_usuario_id: string;
  acao: "visualizar" | "criar" | "editar" | "excluir" | "gerenciar";
  ativo: boolean;
  created_at: string;
  funcionalidade?: Funcionalidade;
  perfil_usuario?: Perfil;
}

export interface UsuarioPerfil {
  id: string;
  usuario_organizacao_id: string;
  perfil_usuario_id: string;
  ativo: boolean;
  data_inicio: string;
  created_at: string;
  perfil_usuario?: Perfil;
}

export interface UsuarioPermissoes {
  usuario_id: string;
  organizacao_id: string;
  permissoes: Permissao[];
  perfis: Perfil[];
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
