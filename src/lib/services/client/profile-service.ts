import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import { UserProfileResponseDto } from "@/types/dto/profile";
import { Profile, UserProfile } from "@/types/models/profile";

interface GetProfilesParams {
  search?: string;
  includeInactive?: boolean;
}

export const ProfileService = {
  /**
   * Busca perfis do backend (API REST)
   */
  async getProfiles(params: GetProfilesParams = {}): Promise<Profile[]> {
    const { search, includeInactive } = params;
    const { data, status } = await api.get<ApiResponse<Profile[]>>(
      "/profiles",
      {
        params: {
          search: search || undefined,
          includeInactive: includeInactive ? "true" : undefined,
        },
      }
    );
    console.log("⚙️ Resposta da API de perfis:", { data, status });
    if (!data || !Array.isArray(data.data)) {
      throw new Error("Não foi possível carregar os perfis");
    }
    console.log("⚙️ Dados dos perfis recebidos:", data.data);
    return data.data;
  },

  /**
   * Busca um perfil pelo slug (API REST)
   */
  async getProfileBySlug(slug: string): Promise<Profile | null> {
    if (!slug) return null;
    try {
      const { data, status } = await api.get<Profile>(`/profiles/${slug}`);
      if (!data || status !== 200) return null;
      return data;
    } catch (error) {
      return null;
    }
  },

  /**
   * Busca todos os perfis disponíveis para o usuário informado
   */
  async getAvailableProfiles(): Promise<UserProfile[]> {
    try {
      const { data, status } = await api.get<UserProfileResponseDto[]>(
        `/profiles/available`
      );
      if (!Array.isArray(data) || status !== 200) return [];
      return data;
    } catch (error) {
      return [];
    }
  },
};
