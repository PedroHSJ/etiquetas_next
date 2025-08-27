import { supabase } from '../supabaseClient';
import { Convite, PerfilUsuario } from '@/types/onboarding';

export class InviteService {
  // Buscar convites pendentes para um email
  static async getPendingInvites(email: string): Promise<Convite[]> {
    const { data, error } = await supabase
      .from('convites')
      .select(`
        *,
        organizacao:organizacoes(nome, tipo),
        perfil:perfis_usuario(nome, descricao)
      `)
      .eq('email', email)
      .eq('status', 'pendente')
      .gt('expira_em', new Date().toISOString())
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar convites:', error);
      throw new Error('Erro ao buscar convites');
    }

    return data || [];
  }

  // Aceitar um convite
  static async acceptInvite(tokenInvite: string, userId: string): Promise<boolean> {
    // Primeiro, buscar o convite
    const { data: convite, error: fetchError } = await supabase
      .from('convites')
      .select('*')
      .eq('token_invite', tokenInvite)
      .eq('status', 'pendente')
      .gt('expira_em', new Date().toISOString())
      .single();

    if (fetchError || !convite) {
      throw new Error('Convite não encontrado ou expirado');
    }

    // Atualizar o convite para aceito
    const { error: updateError } = await supabase
      .from('convites')
      .update({
        status: 'aceito',
        aceito_em: new Date().toISOString(),
        aceito_por: userId
      })
      .eq('id', convite.id);

    if (updateError) {
      console.error('Erro ao aceitar convite:', updateError);
      throw new Error('Erro ao aceitar convite');
    }

    // Adicionar usuário à organização
    const { error: insertError } = await supabase
      .from('usuarios_organizacoes')
      .insert({
        usuario_id: userId,
        organizacao_id: convite.organizacao_id,
        perfil_id: convite.perfil_id,
        ativo: true
      });

    if (insertError) {
      console.error('Erro ao adicionar usuário à organização:', insertError);
      throw new Error('Erro ao adicionar usuário à organização');
    }

    return true;
  }

  // Criar um novo convite (apenas gestores)
  static async createInvite(
    email: string,
    organizacaoId: string,
    perfilId: string,
    convidadoPor: string
  ): Promise<Convite> {
    const tokenInvite = self.crypto?.randomUUID?.() || 
      Math.random().toString(36).substring(2, 15) + 
      Math.random().toString(36).substring(2, 15);
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7); // 7 dias

    console.log('Tentando criar convite:', {
      email,
      organizacao_id: organizacaoId,
      perfil_id: perfilId,
      token_invite: tokenInvite,
      expira_em: expiraEm.toISOString(),
      convidado_por: convidadoPor
    });

    const { data, error } = await supabase
      .from('convites')
      .insert({
        email,
        organizacao_id: organizacaoId,
        perfil_id: perfilId,
        token_invite: tokenInvite,
        expira_em: expiraEm.toISOString(),
        convidado_por: convidadoPor
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar convite:', error);
      throw new Error('Erro ao criar convite');
    }

    return data;
  }

  // Buscar perfis disponíveis
  static async getPerfis(): Promise<PerfilUsuario[]> {
    const { data, error } = await supabase
      .from('perfis_usuario')
      .select('*')
      .order('nome');

    if (error) {
      console.error('Erro ao buscar perfis:', error);
      throw new Error('Erro ao buscar perfis');
    }

    return data || [];
  }

  // Verificar se usuário já está em uma organização
  static async checkUserOrganization(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from('usuarios_organizacoes')
      .select('id')
      .eq('usuario_id', userId)
      .eq('ativo', true)
      .limit(1);

    if (error) {
      console.error('Erro ao verificar organização do usuário:', error);
      return false;
    }

    return data && data.length > 0;
  }
}
