import { api } from "@/lib/apiClient";
import { UserPermissions } from "@/types/models/profile";

export const PermissionService = {
  /**
   * Busca todas as permissões do usuário para uma organização
   */
  async getUserPermissions(organizationId: string): Promise<UserPermissions> {
    const { data, status } = await api.get<UserPermissions>(`/permissions`, {
      params: { organizationId },
    });
    if (status !== 200) throw new Error("Não foi possível buscar permissões");
    // Quando não há permissões, a API pode retornar null; tratamos como "sem permissões"
    return (data as UserPermissions | null) ?? ({} as UserPermissions);
  },

  /**
   * Verifica se o usuário tem permissão para uma ação/funcionalidade
   */
  async hasPermission(
    organizationId: string,
    functionalityName: string,
    action: string,
  ): Promise<boolean> {
    const { data, status } = await api.get<{ allowed: boolean }>(
      `/permissions/check`,
      {
        params: { organizationId, functionalityName, action },
      },
    );
    if (!data || status !== 200) return false;
    return data.allowed;
  },

  /**
   * Atribui um perfil a um usuário
   */
  async assignProfileToUser(
    userOrganizationId: string,
    profileId: string,
  ): Promise<boolean> {
    const { data, status } = await api.post(`/permissions/assign-profile`, {
      userOrganizationId,
      profileId,
    });
    return !!data?.success && status === 200;
  },

  /**
   * Remove um perfil de um usuário
   */
  async removeProfileFromUser(
    userOrganizationId: string,
    profileId: string,
  ): Promise<boolean> {
    const { data, status } = await api.post(`/permissions/remove-profile`, {
      userOrganizationId,
      profileId,
    });
    return !!data?.success && status === 200;
  },
};
