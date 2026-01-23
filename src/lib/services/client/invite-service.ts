import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import {
  CreateInviteDto,
  InviteWithRelationsResponseDto,
  ListInvitesDto,
} from "@/types/dto/invite";
import { toInviteModel, toInviteModelList } from "@/lib/converters/invite";
import { Invite } from "@/types/models/invite";

export class InviteService {
  /**
   * Lista convites com filtros opcionais
   */
  static async listInvites(params: ListInvitesDto = {}): Promise<Invite[]> {
    const { data, status } = await api.get<
      ApiResponse<InviteWithRelationsResponseDto[]>
    >("/invites", {
      params,
    });

    if (!data?.data || status !== 200) {
      return [];
    }

    return toInviteModelList(data.data);
  }

  /**
   * Busca convites pendentes para o usuário autenticado
   */
  static async getPendingInvites(): Promise<Invite[]> {
    const { data, status } = await api.get<
      ApiResponse<InviteWithRelationsResponseDto[]>
    >("/invites", {
      params: { pending: "true" },
    });

    if (!data?.data || status !== 200) {
      return [];
    }

    return toInviteModelList(data.data);
  }

  /**
   * Aceita um convite usando o token
   */
  static async acceptInvite(inviteToken: string): Promise<boolean> {
    await api.post("/invites/accept", { inviteToken });
    return true;
  }

  /**
   * Cria um novo convite
   */
  static async createInvite(dto: CreateInviteDto): Promise<Invite> {
    const { data, status } = await api.post<
      ApiResponse<InviteWithRelationsResponseDto>
    >("/invites", dto);

    if (!data?.data || (status !== 200 && status !== 201)) {
      throw new Error("Erro ao criar convite");
    }

    return toInviteModel(data.data);
  }

  /**
   * Lista convites por e-mail (onboarding legado)
   */
  static async getInvitesByEmail(email: string): Promise<Invite[]> {
    const { data, status } = await api.get<
      ApiResponse<InviteWithRelationsResponseDto[]>
    >("/invites", {
      params: { email },
    });

    if (!data?.data || status !== 200) {
      return [];
    }

    return toInviteModelList(data.data);
  }

  /**
   * Lista convites enviados por uma organização
   */
  static async getInvitesByOrganization(
    organizationId: string,
  ): Promise<Invite[]> {
    if (!organizationId) return [];

    const { data, status } = await api.get<
      ApiResponse<InviteWithRelationsResponseDto[]>
    >("/invites", {
      params: { organizationId, scope: "organization" },
    });

    if (!data?.data || status !== 200) {
      return [];
    }

    return toInviteModelList(data.data);
  }

  /**
   * Rejeita um convite pelo ID
   */
  static async rejectInvite(inviteId: string): Promise<boolean> {
    const { status } = await api.post("/invites/reject", { inviteId });
    return status === 200;
  }

  /**
   * Cancela um convite pelo ID
   */
  static async cancelInvite(inviteId: string): Promise<boolean> {
    const { status } = await api.post("/invites/cancel", { inviteId });
    return status === 200;
  }

  /**
   * Verifica se o usuário já possui organização vinculada
   */
  static async checkUserOrganization(userId: string): Promise<boolean> {
    const { data, status } = await api.get<ApiResponse<unknown[]>>(
      "/user-organizations",
      {
        params: { userId },
      },
    );

    if (!data || !Array.isArray(data.data) || status !== 200) {
      return false;
    }

    return data.data.length > 0;
  }

  /**
   * Mapeia status para informações de UI
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
}
