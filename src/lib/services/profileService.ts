import { supabase } from "@/lib/supabaseClient";

export interface UserProfile {
  id: string;
  usuario_id: string;
  organizacao_id: string;
  perfil: string;
  organizacao_nome: string;
  ativo: boolean;
  created_at: string;
}

export class ProfileService {
  /**
   * Busca todos os perfis disponíveis para o usuário autenticado
   */
  static async getAvailableProfiles(): Promise<UserProfile[]> {
    try {
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      
      if (authError || !user) {
        throw new Error('Usuário não autenticado');
      }

      const { data, error } = await supabase
        .from('usuarios_organizacoes')
        .select(`
          id,
          usuario_id,
          organizacao_id,
          perfil,
          ativo,
          created_at,
          organizacao:organizacoes (
            nome
          )
        `)
        .eq('usuario_id', user.id)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar perfis:', error);
        throw new Error('Erro ao buscar perfis do usuário');
      }

      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        usuario_id: item.usuario_id,
        organizacao_id: item.organizacao_id,
        perfil: item.perfil,
        organizacao_nome: item.organizacao?.nome || 'Organização não encontrada',
        ativo: item.ativo,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Erro no ProfileService.getAvailableProfiles:', error);
      throw error;
    }
  }

  /**
   * Busca perfis de um usuário específico
   */
  static async getUserProfiles(userId: string): Promise<UserProfile[]> {
    try {
      const { data, error } = await supabase
        .from('usuarios_organizacoes')
        .select(`
          id,
          usuario_id,
          organizacao_id,
          perfil,
          ativo,
          created_at,
          organizacao:organizacoes (
            nome
          )
        `)
        .eq('usuario_id', userId)
        .eq('ativo', true);

      if (error) {
        console.error('Erro ao buscar perfis do usuário:', error);
        throw new Error('Erro ao buscar perfis do usuário');
      }

      if (!data) return [];

      return data.map(item => ({
        id: item.id,
        usuario_id: item.usuario_id,
        organizacao_id: item.organizacao_id,
        perfil: item.perfil,
        organizacao_nome: item.organizacao?.nome || 'Organização não encontrada',
        ativo: item.ativo,
        created_at: item.created_at
      }));
    } catch (error) {
      console.error('Erro no ProfileService.getUserProfiles:', error);
      throw error;
    }
  }

  /**
   * Busca um perfil específico por ID
   */
  static async getProfileById(profileId: string): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase
        .from('usuarios_organizacoes')
        .select(`
          id,
          usuario_id,
          organizacao_id,
          perfil,
          ativo,
          created_at,
          organizacao:organizacoes (
            nome
          )
        `)
        .eq('id', profileId)
        .eq('ativo', true)
        .single();

      if (error) {
        console.error('Erro ao buscar perfil:', error);
        return null;
      }

      if (!data) return null;

      return {
        id: data.id,
        usuario_id: data.usuario_id,
        organizacao_id: data.organizacao_id,
        perfil: data.perfil,
        organizacao_nome: data.organizacao?.nome || 'Organização não encontrada',
        ativo: data.ativo,
        created_at: data.created_at
      };
    } catch (error) {
      console.error('Erro no ProfileService.getProfileById:', error);
      return null;
    }
  }

  /**
   * Atualiza um perfil de usuário
   */
  static async updateProfile(profileId: string, updates: Partial<UserProfile>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios_organizacoes')
        .update(updates)
        .eq('id', profileId);

      if (error) {
        console.error('Erro ao atualizar perfil:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no ProfileService.updateProfile:', error);
      return false;
    }
  }

  /**
   * Desativa um perfil de usuário
   */
  static async deactivateProfile(profileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('usuarios_organizacoes')
        .update({ ativo: false })
        .eq('id', profileId);

      if (error) {
        console.error('Erro ao desativar perfil:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro no ProfileService.deactivateProfile:', error);
      return false;
    }
  }
}
