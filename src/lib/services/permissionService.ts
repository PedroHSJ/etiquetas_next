import { supabase } from "@/lib/supabaseClient";
import {
  Funcionalidade,
  Permissao,
  PerfilUsuario,
  UsuarioPerfil,
  UsuarioPermissoes,
  VerificacaoPermissao,
  ConfiguracaoPerfil,
  ConfiguracaoFuncionalidade,
} from "@/types/permissions";

export class PermissionService {
  /**
   * Verifica se um usuário tem permissão para uma ação específica
   */
  static async verificarPermissao(
    funcionalidade: string,
    acao: string,
    usuario_id: string,
    organizacao_id: string
  ): Promise<boolean> {
    try {
      // Buscar o usuario_organizacao_id
      const { data: usuarioOrg, error: usuarioOrgError } = await supabase
        .from('usuarios_organizacoes')
        .select('id')
        .eq('usuario_id', usuario_id)
        .eq('organizacao_id', organizacao_id)
        .eq('ativo', true)
        .single();

      if (usuarioOrgError || !usuarioOrg) {
        console.error('Erro ao buscar usuário na organização:', usuarioOrgError);
        return false;
      }

      // Buscar permissões do usuário através de usuarios_perfis
      const { data, error } = await supabase
        .from('usuarios_perfis')
        .select(`
          id,
          perfil_usuario:perfis_usuario (
            id,
            nome,
            nivel_acesso
          )
        `)
        .eq('usuario_organizacao_id', usuarioOrg.id)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao verificar permissão:', error);
        return false;
      }

      if (!data || data.length === 0) return false;

      // Usuários master têm acesso total
      for (const item of data) {
        const perfil = item.perfil_usuario;
        if (perfil && Array.isArray(perfil) && perfil.length > 0 && perfil[0].nome === 'master') {
          return true;
        }
      }

      // Verificar permissão específica através da tabela permissoes
      for (const item of data) {
        const perfil = item.perfil_usuario;
        if (perfil && Array.isArray(perfil) && perfil.length > 0) {
          const perfilId = perfil[0].id;
          
          // Buscar permissões para este perfil
          const { data: permissoesData, error: permissoesError } = await supabase
            .from('permissoes')
            .select(`
              id,
              acao,
              funcionalidade:funcionalidades (
                id,
                nome
              )
            `)
            .eq('perfil_usuario_id', perfilId)
            .eq('ativo', true);

          if (!permissoesError && permissoesData) {
            for (const perm of permissoesData) {
              const func = perm.funcionalidade;
              if (func && Array.isArray(func) && func.length > 0) {
                if (perm.acao === acao && func[0].nome === funcionalidade) {
                  return true;
                }
              }
            }
          }
        }
      }

      return false;
    } catch (error) {
      console.error('Erro ao verificar permissão:', error);
      return false;
    }
  }

  /**
   * Busca todas as permissões de um usuário em uma organização
   */
  static async getUsuarioPermissoes(
    usuario_id: string,
    organizacao_id: string
  ): Promise<UsuarioPermissoes | null> {
    try {
      // Buscar o usuario_organizacao_id
      const { data: usuarioOrg, error: usuarioOrgError } = await supabase
        .from('usuarios_organizacoes')
        .select('id')
        .eq('usuario_id', usuario_id)
        .eq('organizacao_id', organizacao_id)
        .eq('ativo', true)
        .single();

      if (usuarioOrgError || !usuarioOrg) {
        console.error('Erro ao buscar usuário na organização:', usuarioOrgError);
        return null;
      }

      // Buscar perfis do usuário
      const { data: perfisData, error: perfisError } = await supabase
        .from('usuarios_perfis')
        .select(`
          id,
          perfil_usuario:perfis_usuario (
            id,
            nome,
            descricao,
            nivel_acesso,
            ativo,
            created_at
          )
        `)
        .eq('usuario_organizacao_id', usuarioOrg.id)
        .eq('ativo', true);

      if (perfisError) {
        console.error('Erro ao buscar perfis do usuário:', perfisError);
        return null;
      }

      if (!perfisData || perfisData.length === 0) return null;

      const permissoes: Permissao[] = [];
      const perfis: PerfilUsuario[] = [];

      // Processar perfis
      for (const item of perfisData) {
        const perfil = item.perfil_usuario;
        if (perfil && Array.isArray(perfil) && perfil.length > 0) {
          const p = perfil[0];
          perfis.push({
            id: p.id,
            nome: p.nome,
            descricao: p.descricao,
            nivel_acesso: p.nivel_acesso as 1 | 2 | 3 | 4,
            ativo: p.ativo,
            created_at: p.created_at
          });

          // Buscar permissões para este perfil
          const { data: permissoesData, error: permissoesError } = await supabase
            .from('permissoes')
            .select(`
              id,
              acao,
              funcionalidade:funcionalidades (
                id,
                nome,
                descricao,
                categoria,
                rota,
                ativo,
                created_at
              )
            `)
            .eq('perfil_usuario_id', p.id)
            .eq('ativo', true);

          if (!permissoesError && permissoesData) {
            for (const perm of permissoesData) {
              const func = perm.funcionalidade;
              permissoes.push({
                id: perm.id,
                funcionalidade_id: '', // Campo não existe no resultado do Supabase
                perfil_usuario_id: p.id,
                acao: perm.acao as 'visualizar' | 'criar' | 'editar' | 'excluir' | 'gerenciar',
                ativo: true,
                created_at: new Date().toISOString(),
                funcionalidade: func && Array.isArray(func) && func.length > 0 ? {
                  id: func[0].id,
                  nome: func[0].nome,
                  descricao: func[0].descricao,
                  categoria: func[0].categoria as 'gestao' | 'operacional' | 'relatorios',
                  rota: func[0].rota,
                  ativo: func[0].ativo,
                  created_at: func[0].created_at
                } : undefined
              });
            }
          }
        }
      }

      return {
        usuario_id,
        organizacao_id,
        permissoes,
        perfis
      };
    } catch (error) {
      console.error('Erro ao buscar permissões do usuário:', error);
      return null;
    }
  }

  /**
   * Busca todos os perfis de usuário disponíveis
   */
  static async getPerfisUsuario(): Promise<PerfilUsuario[]> {
    const { data, error } = await supabase
      .from('perfis_usuario')
      .select('*')
      .eq('ativo', true)
      .order('nivel_acesso', { ascending: false });

    if (error) {
      console.error('Erro ao buscar perfis de usuário:', error);
      throw new Error('Erro ao buscar perfis de usuário');
    }

    return data || [];
  }

  /**
   * Busca todas as funcionalidades disponíveis
   */
  static async getFuncionalidades(): Promise<Funcionalidade[]> {
    const { data, error } = await supabase
      .from('funcionalidades')
      .select('*')
      .eq('ativo', true)
      .order('categoria', { ascending: true })
      .order('nome', { ascending: true });

    if (error) {
      console.error('Erro ao buscar funcionalidades:', error);
      throw new Error('Erro ao buscar funcionalidades');
    }

    return data || [];
  }

  /**
   * Busca todas as permissões disponíveis
   */
  static async getPermissoes(): Promise<Permissao[]> {
    const { data, error } = await supabase
      .from('permissoes')
      .select(`
        *,
        funcionalidade:funcionalidades (
          id,
          nome,
          descricao,
          categoria
        ),
        perfil_usuario:perfis_usuario (
          id,
          nome,
          descricao
        )
      `)
      .eq('ativo', true)
      .order('funcionalidade_id', { ascending: true })
      .order('acao', { ascending: true });

    if (error) {
      console.error('Erro ao buscar permissões:', error);
      throw new Error('Erro ao buscar permissões');
    }

    return data || [];
  }

  /**
   * Busca configuração completa de um perfil
   */
  static async getConfiguracaoPerfil(perfil_id: string): Promise<ConfiguracaoPerfil | null> {
    try {
      const { data: perfil, error: perfilError } = await supabase
        .from('perfis_usuario')
        .select('*')
        .eq('id', perfil_id)
        .single();

      if (perfilError) {
        console.error('Erro ao buscar perfil:', perfilError);
        return null;
      }

      const { data: permissoes, error: permissoesError } = await supabase
        .from('permissoes')
        .select(`
          id,
          acao,
          funcionalidade:funcionalidades (
            id,
            nome,
            descricao,
            categoria,
            rota
          )
        `)
        .eq('perfil_usuario_id', perfil_id)
        .eq('ativo', true);

      if (permissoesError) {
        console.error('Erro ao buscar permissões do perfil:', permissoesError);
        return null;
      }

      const permissoesConfig = permissoes?.map(p => {
        const func = p.funcionalidade;
        return {
          funcionalidade_id: '', // Campo não existe no resultado do Supabase
          funcionalidade_nome: func && Array.isArray(func) && func.length > 0 ? func[0].nome : '',
          acao: p.acao || '',
          ativo: true
        };
      }) || [];

      return {
        perfil_id: perfil.id,
        nome: perfil.nome,
        descricao: perfil.descricao,
        nivel_acesso: perfil.nivel_acesso,
        permissoes: permissoesConfig
      };
    } catch (error) {
      console.error('Erro ao buscar configuração do perfil:', error);
      return null;
    }
  }

  /**
   * Atualiza as permissões de um perfil
   */
  static async atualizarPermissoesPerfil(
    perfil_id: string,
    permissoes: { funcionalidade_id: string; acao: string; ativo: boolean }[]
  ): Promise<boolean> {
    try {
      // Primeiro, desativa todas as permissões existentes
      const { error: deactivateError } = await supabase
        .from('permissoes')
        .update({ ativo: false })
        .eq('perfil_usuario_id', perfil_id);

      if (deactivateError) {
        console.error('Erro ao desativar permissões:', deactivateError);
        return false;
      }

      // Ativa as permissões selecionadas
      for (const permissao of permissoes) {
        if (permissao.ativo) {
          // Verificar se já existe
          const { data: existingData } = await supabase
            .from('permissoes')
            .select('id')
            .eq('perfil_usuario_id', perfil_id)
            .eq('funcionalidade_id', permissao.funcionalidade_id)
            .eq('acao', permissao.acao)
            .single();

          if (existingData) {
            // Reativar permissão existente
            await supabase
              .from('permissoes')
              .update({ ativo: true })
              .eq('id', existingData.id);
          } else {
            // Criar nova permissão
            await supabase
              .from('permissoes')
              .insert({
                perfil_usuario_id: perfil_id,
                funcionalidade_id: permissao.funcionalidade_id,
                acao: permissao.acao,
                ativo: true
              });
          }
        }
      }

      return true;
    } catch (error) {
      console.error('Erro ao atualizar permissões do perfil:', error);
      return false;
    }
  }

  /**
   * Atribui um perfil de usuário a um usuário
   */
  static async atribuirPerfilUsuario(
    usuario_organizacao_id: string,
    perfil_usuario_id: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios_perfis')
        .upsert({
          usuario_organizacao_id,
          perfil_usuario_id,
          ativo: true,
          data_inicio: new Date().toISOString()
        }, {
          onConflict: 'usuario_organizacao_id,perfil_usuario_id'
        });

      if (error) {
        console.error('Erro ao atribuir perfil ao usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao atribuir perfil ao usuário:', error);
      return false;
    }
  }

  /**
   * Remove um perfil de usuário de um usuário
   */
  static async removerPerfilUsuario(
    usuario_organizacao_id: string,
    perfil_usuario_id: string
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios_perfis')
        .update({ 
          ativo: false
        })
        .eq('usuario_organizacao_id', usuario_organizacao_id)
        .eq('perfil_usuario_id', perfil_usuario_id);

      if (error) {
        console.error('Erro ao remover perfil do usuário:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao remover perfil do usuário:', error);
      return false;
    }
  }
}
