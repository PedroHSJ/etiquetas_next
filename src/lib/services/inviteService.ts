import { Profile } from "@/types/models/profile";
import { api } from "@/lib/apiClient";
import { Invite } from "@/types/models/invite";

/**
 * Client-side service for invite management (uses REST API)
 */
export class InviteService {
  // /**
  //  * Map database entity to frontend Convite type
  //  */
  // private static mapInviteEntityToConvite(
  //   invite: InviteWithRelationsEntity
  // ): Invite {
  //   return {
  //     id: invite.id,
  //     email: invite.email,
  //     organizationId: invite.organization_id,
  //     profileId: invite.profile_id,
  //     status: (invite.status === "pending"
  //       ? "pendente"
  //       : invite.status === "accepted"
  //       ? "aceito"
  //       : invite.status === "rejected"
  //       ? "rejeitado"
  //       : invite.status === "expired"
  //       ? "expirado"
  //       : "cancelado") as
  //       | "pendente"
  //       | "aceito"
  //       | "rejeitado"
  //       | "expirado"
  //       | "cancelado",
  //     inviteToken: invite.invite_token,
  //     expiresAt: invite.expires_at,
  //     invitedBy: invite.invited_by,
  //     created_at: invite.created_at,
  //     aceito_em: invite.accepted_at,
  //     aceito_por: invite.accepted_by,
  //     rejeitado_em: invite.rejected_at,
  //     rejeitado_por: invite.rejected_by,
  //     organizacao: invite.organization,
  //     perfil: invite.profile
  //       ? {
  //           id: invite.profile.id,
  //           name: invite.profile.name,
  //           description: invite.profile.description || null,
  //           active: true,
  //           createdAt: new Date(),
  //         }
  //       : undefined,
  //   };
  // }

  /**
   * Get pending invites for current user (via API REST)
   */
  static async getPendingInvites(): Promise<Invite[]> {
    try {
      const { data } = await api.get<Invite[]>("/invites", {
        params: { pending: "true" },
      });
      console.log("Fetched invites data:", data);
      return data;
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
      throw new Error("Erro ao buscar convites");
    }
  }

  /**
   * Accept an invite (via API REST)
   */
  static async acceptInvite(tokenInvite: string): Promise<boolean> {
    try {
      await api.post("/invites/accept", {
        inviteToken: tokenInvite,
      });
      return true;
    } catch (error) {
      console.error("Erro ao aceitar convite:", error);
      throw new Error("Erro ao aceitar convite");
    }
  }

  /**
   * Create a new invite (via API REST)
   */
  static async createInvite(
    email: string,
    organizacaoId: string,
    perfilId: string
  ): Promise<Invite> {
    try {
      const { data } = await api.post<Invite>("/invites", {
        email,
        organizationId: organizacaoId,
        profileId: perfilId,
      });

      return data;
    } catch (error) {
      console.error("Erro ao criar convite:", error);
      throw new Error("Erro ao criar convite");
    }
  }

  /**
   * Get all available profiles (via API REST)
   */
  static async getPerfis(): Promise<Profile[]> {
    try {
      const { data } = await api.get<Profile[]>("/profiles");
      return data || [];
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      throw new Error("Erro ao buscar perfis");
    }
  }

  /**
   * Check if user already has an organization (via API REST)
   */
  static async checkUserOrganization(userId: string): Promise<boolean> {
    try {
      const { data } = await api.get<any[]>("/user-organizations", {
        params: { userId },
      });
      console.log("User organizations data:", data);
      return data && data.length > 0;
    } catch (error) {
      console.error("Erro ao verificar organização do usuário:", error);
      return false;
    }
  }

  /**
   * Map status to UI information
   */
  static getStatusInfo(status: string) {
    switch (status) {
      case "aceito":
        return { label: "Aceito", variant: "default", color: "text-green-600" };
      case "rejeitado":
        return {
          label: "Rejeitado",
          variant: "destructive",
          color: "text-red-600",
        };
      case "expirado":
        return {
          label: "Expirado",
          variant: "secondary",
          color: "text-gray-600",
        };
      case "cancelado":
        return {
          label: "Cancelado",
          variant: "secondary",
          color: "text-orange-600",
        };
      case "pendente":
      default:
        return {
          label: "Pendente",
          variant: "outline",
          color: "text-yellow-600",
        };
    }
  }
}
