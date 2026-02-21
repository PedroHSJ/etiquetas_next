import { useQuery, useQueryClient } from "@tanstack/react-query";
import { ProfileService } from "@/lib/services/client/profile-service";
import { UserProfileResponseDto } from "@/types/dto/profile/response";
import { useAuth } from "@/contexts/AuthContext";

export const USER_PROFILES_QUERY_KEY = ["user-profiles"] as const;

/**
 * Hook para buscar perfis do usuário usando React Query
 * Permite invalidação automática após criar/editar organizações
 */
export function useUserProfilesQuery() {
  const { userId } = useAuth();

  const query = useQuery<UserProfileResponseDto[], Error>({
    queryKey: [...USER_PROFILES_QUERY_KEY, userId],
    queryFn: async () => {
      if (!userId) return [];
      return await ProfileService.getAvailableProfiles();
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  return {
    userProfiles: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}

/**
 * Hook para invalidar queries de perfis do usuário
 */
export function useInvalidateUserProfiles() {
  const queryClient = useQueryClient();

  return () => {
    return queryClient.invalidateQueries({
      queryKey: USER_PROFILES_QUERY_KEY,
    });
  };
}
