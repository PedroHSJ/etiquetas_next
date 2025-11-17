import { Profile } from "@/types/models/profile";
import { api } from "@/lib/apiClient";
import { Invite } from "@/types/models/invite";
import { ApiResponse } from "@/types/common";
import { InviteWithRelationsResponseDto } from "@/types/dto/invite";
import { toInviteModel, toInviteModelList } from "@/lib/converters/invite";

/**
 * Client-side service for invite management (uses REST API)
 */
export class InviteService {
  // Legacy mapping removed (invites now use DTO -> model converters)

  /**
   * Get pending invites for current user (via API REST)
   */
  static async getPendingInvites(): Promise<Invite[]> {
    try {
      const { data, status } = await api.get<
        ApiResponse<InviteWithRelationsResponseDto[]>
      >("/invites", {
        params: { pending: "true" },
      });
      if (!data || !Array.isArray(data.data) || status !== 200) {
        return [];
      }
      return toInviteModelList(data.data);
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
      const { data, status } = await api.post<
        ApiResponse<InviteWithRelationsResponseDto>
      >("/invites", {
        email,
        organizationId: organizacaoId,
        profileId: perfilId,
      });

      if (!data || !data.data || (status !== 200 && status !== 201)) {
        throw new Error("Erro ao criar convite");
      }

      return toInviteModel(data.data);
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
      const { data, status } = await api.get<ApiResponse<any[]>>(
        "/user-organizations",
        {
          params: { userId },
        }
      );
      if (!data || !Array.isArray(data.data) || status !== 200) {
        return false;
      }
      console.log("User organizations data:", data.data);
      return data.data.length > 0;
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
      case "accepted":
        return { label: "Aceito", variant: "default", color: "text-green-600" };
      case "rejected":
        return {
          label: "Rejeitado",
          variant: "destructive",
          color: "text-red-600",
        };
      case "expired":
        return {
          label: "Expirado",
          variant: "secondary",
          color: "text-gray-600",
        };
      case "canceled":
        return {
          label: "Cancelado",
          variant: "secondary",
          color: "text-orange-600",
        };
      case "pending":
      default:
        return {
          label: "Pendente",
          variant: "outline",
          color: "text-yellow-600",
        };
    }
  }

  /**
   * Lista convites pelo e-mail (fluxo legado de onboarding/convites)
   */
  static async getInvitesByEmail(email: string): Promise<Invite[]> {
    try {
      const { data, status } = await api.get<
        ApiResponse<InviteWithRelationsResponseDto[]>
      >("/invites", {
        params: { email },
      });

      if (!data || !Array.isArray(data.data) || status !== 200) {
        return [];
      }

      return toInviteModelList(data.data);
    } catch (error) {
      console.error("Erro ao buscar convites por e-mail:", error);
      return [];
    }
  }

  /**
   * Lista convites enviados por uma organização
   */
  static async getInvitesByOrganization(
    organizationId: string
  ): Promise<Invite[]> {
    if (!organizationId) {
      return [];
    }

    try {
      const { data, status } = await api.get<
        ApiResponse<InviteWithRelationsResponseDto[]>
      >("/invites", {
        params: { organizationId, scope: "organization" },
      });

      if (!data || !Array.isArray(data.data) || status !== 200) {
        return [];
      }

      return toInviteModelList(data.data);
    } catch (error) {
      console.error("Erro ao buscar convites enviados:", error);
      return [];
    }
  }

  /**
   * Rejeita um convite pelo ID
   */
  static async rejectInvite(inviteId: string): Promise<boolean> {
    try {
      const { status } = await api.post("/invites/reject", { inviteId });
      return status === 200;
    } catch (error) {
      console.error("Erro ao rejeitar convite:", error);
      throw new Error("Erro ao rejeitar convite");
    }
  }

  /**
   * Cancela um convite pelo ID
   */
  static async cancelInvite(inviteId: string): Promise<boolean> {
    try {
      const { status } = await api.post("/invites/cancel", { inviteId });
      return status === 200;
    } catch (error) {
      console.error("Erro ao cancelar convite:", error);
      throw new Error("Erro ao cancelar convite");
    }
  }
}
