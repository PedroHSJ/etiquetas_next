import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import {
  UserProfileResponseDto,
  ProfileResponseDto,
} from "@/types/dto/profile/response";

interface GetProfilesParams {
  search?: string;
  includeInactive?: boolean;
}

export const ProfileService = {
  /**
   * Busca perfis do backend (API REST)
   */
  async getProfiles(
    params: GetProfilesParams = {},
  ): Promise<ProfileResponseDto[]> {
    const { search, includeInactive } = params;
    const { data, status } = await api.get<ApiResponse<ProfileResponseDto[]>>(
      "/profiles",
      {
        params: {
          search: search || undefined,
          includeInactive: includeInactive ? "true" : undefined,
        },
      },
    );
    if (!data || !Array.isArray(data.data)) {
      throw new Error("Não foi possível carregar os perfis");
    }
    return data.data;
  },

  /**
   * Busca um perfil pelo slug (API REST)
   */
  async getProfileBySlug(slug: string): Promise<ProfileResponseDto | null> {
    if (!slug) return null;
    try {
      const { data, status } = await api.get<ProfileResponseDto>(
        `/profiles/${slug}`,
      );
      if (!data || status !== 200) return null;
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Busca todos os perfis disponíveis para o usuário informado
   */
  async getAvailableProfiles(): Promise<UserProfileResponseDto[]> {
    try {
      const { data, status } =
        await api.get<UserProfileResponseDto[]>(`/profiles/available`);
      if (!Array.isArray(data) || status !== 200) return [];

      return data;
    } catch (error) {
      return [];
    }
  },
};
