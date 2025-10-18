import { supabase } from "../supabaseClient";
import { Convite } from "@/types/onboarding";
import { Perfil } from "@/types/permissions";

interface User {
  id: string;
  email?: string;
  user_metadata?: Record<string, unknown>;
}

export class InviteService {
  // Buscar dados de múltiplos usuários via RPC (mais eficiente)
  private static async getMultipleUsersData(userIds: string[]) {
    if (userIds.length === 0) return {};

    try {
      const { data, error } = await supabase.rpc("get_multiple_users_data", { user_ids: userIds });

      if (error) {
        console.error("Erro ao buscar dados dos usuários:", error);
        return {};
      }

      // Converter array para objeto indexado por ID
      const usersMap: Record<string, User> = {};
      (data || []).forEach((user: User) => {
        usersMap[user.id] = user;
      });

      return usersMap;
    } catch (error) {
      console.error("Erro ao buscar dados dos usuários:", error);
      return {};
    }
  }

  // Buscar convites pendentes para um email
  static async getPendingInvites(email: string): Promise<Convite[]> {
    const { data, error } = await supabase
      .from("convites")
      .select(
        `
        *,
        organizacao:organizacoes(nome, tipo),
        perfil:perfis(nome, descricao)
      `
      )
      .eq("email", email)
      .eq("status", "pendente")
      .gt("expira_em", new Date().toISOString())
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar convites:", error);
      throw new Error("Erro ao buscar convites");
    }

    if (!data || data.length === 0) return [];

    // Buscar dados de todos os usuários de uma vez
    const userIds = [...new Set(data.map((convite) => convite.convidado_por))];
    const usersData = await this.getMultipleUsersData(userIds);

    // Mapear convites com dados dos usuários
    const convitesComUsuario = data.map((convite) => ({
      ...convite,
      convidado_por_usuario: usersData[convite.convidado_por] || { nome: "Usuário", email: "" },
    }));

    return convitesComUsuario;
  }

  // Aceitar um convite
  static async acceptInvite(tokenInvite: string, userId: string): Promise<boolean> {
    // Primeiro, buscar o convite
    const { data: convite, error: fetchError } = await supabase
      .from("convites")
      .select("*")
      .eq("token_invite", tokenInvite)
      .eq("status", "pendente")
      .gt("expira_em", new Date().toISOString())
      .single();

    if (fetchError || !convite) {
      throw new Error("Convite não encontrado ou expirado");
    }

    // Atualizar o convite para aceito
    const { error: updateError } = await supabase
      .from("convites")
      .update({
        status: "aceito",
        aceito_em: new Date().toISOString(),
        aceito_por: userId,
      })
      .eq("id", convite.id);

    if (updateError) {
      console.error("Erro ao aceitar convite:", updateError);
      throw new Error("Erro ao aceitar convite");
    }

    // Adicionar usuário à organização
    const { data: userOrgData, error: insertError } = await supabase
      .from("usuarios_organizacoes")
      .insert({
        usuario_id: userId,
        organizacao_id: convite.organizacao_id,
        perfil_id: convite.perfil_id,
        ativo: true,
      })
      .select()
      .single();

    if (insertError || !userOrgData) {
      console.error("Erro ao adicionar usuário à organização:", insertError);
      throw new Error("Erro ao adicionar usuário à organização");
    }

    // Criar registro em usuarios_perfis
    const { error: userPerfilError } = await supabase.from("usuarios_perfis").insert({
      usuario_organizacao_id: userOrgData.id,
      perfil_usuario_id: convite.perfil_id,
      ativo: true,
    });

    if (userPerfilError) {
      console.error("Erro ao criar perfil do usuário:", userPerfilError);
      throw new Error("Erro ao criar perfil do usuário");
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
    const tokenInvite =
      self.crypto?.randomUUID?.() ||
      Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    const expiraEm = new Date();
    expiraEm.setDate(expiraEm.getDate() + 7); // 7 dias

    console.log("Tentando criar convite:", {
      email,
      organizacao_id: organizacaoId,
      perfil_id: perfilId,
      token_invite: tokenInvite,
      expira_em: expiraEm.toISOString(),
      convidado_por: convidadoPor,
    });

    const { data, error } = await supabase
      .from("convites")
      .insert({
        email,
        organizacao_id: organizacaoId,
        perfil_id: perfilId,
        token_invite: tokenInvite,
        expira_em: expiraEm.toISOString(),
        convidado_por: convidadoPor,
      })
      .select()
      .single();

    if (error) {
      console.error("Erro ao criar convite:", error);
      throw new Error("Erro ao criar convite");
    }

    return data;
  }

  // Buscar perfis disponíveis
  static async getPerfis(): Promise<Perfil[]> {
    const { data, error } = await supabase.from("perfis").select("*").order("nome");

    if (error) {
      console.error("Erro ao buscar perfis:", error);
      throw new Error("Erro ao buscar perfis");
    }

    return data || [];
  }

  // Verificar se usuário já está em uma organização
  static async checkUserOrganization(userId: string): Promise<boolean> {
    const { data, error } = await supabase
      .from("usuarios_organizacoes")
      .select("id")
      .eq("usuario_id", userId)
      .eq("ativo", true)
      .limit(1);

    if (error) {
      console.error("Erro ao verificar organização do usuário:", error);
      return false;
    }

    return data && data.length > 0;
  }

  // Buscar convites por email (todos os status)
  static async getConvitesByEmail(email: string): Promise<Convite[]> {
    const { data, error } = await supabase
      .from("convites")
      .select(
        `
        *,
        organizacao:organizacoes(nome, tipo),
        perfil:perfis(nome, descricao)
      `
      )
      .eq("email", email)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar convites por email:", error);
      throw new Error("Erro ao buscar convites");
    }

    if (!data || data.length === 0) return [];

    // Buscar dados de todos os usuários de uma vez
    const userIds = [...new Set(data.map((convite) => convite.convidado_por))];
    const usersData = await this.getMultipleUsersData(userIds);

    // Mapear convites com dados dos usuários
    const convitesComUsuario = data.map((convite) => ({
      ...convite,
      convidado_por_usuario: usersData[convite.convidado_por] || { nome: "Usuário", email: "" },
    }));

    return convitesComUsuario;
  }

  // Buscar convites por organização e status
  static async getConvitesByStatus(status: string, userEmail: string): Promise<Convite[]> {
    const { data, error } = await supabase
      .from("convites")
      .select(`*, organizacao:organizacoes(nome), perfil:perfis(nome, descricao)`)
      .eq("status", status)
      .eq("email", userEmail)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Erro ao buscar convites por status:", error);
      throw new Error("Erro ao buscar convites");
    }

    if (!data || data.length === 0) return [];

    // Buscar dados de todos os usuários de uma vez
    const userIds = [...new Set(data.map((convite) => convite.convidado_por))];
    const usersData = await this.getMultipleUsersData(userIds);

    // Mapear convites com dados dos usuários
    const convitesComUsuario = data.map((convite) => ({
      ...convite,
      convidado_por_usuario: usersData[convite.convidado_por] || { nome: "Usuário", email: "" },
    }));

    return convitesComUsuario;
  }

  // Aceitar convite por id
  static async aceitarConvite(conviteId: string, userId: string): Promise<boolean> {
    const { error } = await supabase
      .from("convites")
      .update({ status: "aceito", aceito_em: new Date().toISOString(), aceito_por: userId })
      .eq("id", conviteId);

    if (error) {
      console.error("Erro ao aceitar convite:", error);
      return false;
    }

    return true;
  }

  // Rejeitar convite por id
  static async rejeitarConvite(conviteId: string, userId?: string): Promise<boolean> {
    const { error } = await supabase
      .from("convites")
      .update({
        status: "rejeitado",
        rejeitado_em: new Date().toISOString(),
        rejeitado_por: userId || null,
      })
      .eq("id", conviteId);

    if (error) {
      console.error("Erro ao rejeitar convite:", error);
      return false;
    }

    return true;
  }

  // Cancelar convite por id
  static async cancelarConvite(conviteId: string): Promise<boolean> {
    const { error } = await supabase
      .from("convites")
      .update({ status: "cancelado", cancelado_em: new Date().toISOString() })
      .eq("id", conviteId);

    if (error) {
      console.error("Erro ao cancelar convite:", error);
      return false;
    }

    return true;
  }

  // Mapear informações de status para label/variant/color
  static getStatusInfo(status: string) {
    switch (status) {
      case "aceito":
        return { label: "Aceito", variant: "default", color: "text-green-600" };
      case "rejeitado":
        return { label: "Rejeitado", variant: "destructive", color: "text-red-600" };
      case "expirado":
        return { label: "Expirado", variant: "secondary", color: "text-gray-600" };
      case "cancelado":
        return { label: "Cancelado", variant: "secondary", color: "text-orange-600" };
      case "pendente":
      default:
        return { label: "Pendente", variant: "outline", color: "text-yellow-600" };
    }
  }
}
