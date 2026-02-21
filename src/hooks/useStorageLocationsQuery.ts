import { useQuery } from "@tanstack/react-query";
import { StorageLocationService } from "@/lib/services/client/storage-location-service";
import {
  StorageLocationResponseDto,
  ListStorageLocationsDto,
} from "@/types/dto/storage-location";

interface UseStorageLocationsQueryOptions extends ListStorageLocationsDto {
  enabled?: boolean;
}

export const useStorageLocationsQuery = (
  options: UseStorageLocationsQueryOptions = {},
) => {
  const { organizationId, search, parentId, enabled = true } = options;

  return useQuery<StorageLocationResponseDto[]>({
    queryKey: ["storage-locations", { organizationId, search, parentId }],
    enabled,
    queryFn: () =>
      StorageLocationService.getStorageLocations({
        organizationId,
        search,
        parentId,
      }),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
