import { useQuery } from "@tanstack/react-query";
import { ProfileService } from "@/lib/services/client/profile-service";
import { Profile } from "@/types/models/profile";

interface UseProfilesQueryOptions {
  search?: string;
  includeInactive?: boolean;
  enabled?: boolean;
}

export const useProfilesQuery = (options: UseProfilesQueryOptions = {}) => {
  const { search, includeInactive = false, enabled = true } = options;

  return useQuery<Profile[]>({
    queryKey: ["profiles", { search, includeInactive }],
    enabled,
    queryFn: () => ProfileService.getProfiles({ search, includeInactive }),
    staleTime: 5 * 60 * 1000,
  });
};
