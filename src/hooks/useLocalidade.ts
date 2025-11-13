import { useQuery, useMutation } from "@tanstack/react-query";
import { LocationService } from "@/lib/services/client/localidade-service";

export function useFetchCEP(cep: string) {
  return useQuery({
    queryKey: ["cep", cep],
    queryFn: () => LocationService.fetchCEP(cep),
    enabled: !!cep && LocationService.validateCEP(cep),
  });
}

export function useFetchOrCreateCity() {
  return useMutation({
    mutationFn: (cep: string) => LocationService.fetchOrCreateCity(cep),
  });
}

export function useListStates() {
  return useQuery({
    queryKey: ["states"],
    queryFn: LocationService.listStates,
  });
}

export function useListCitiesByState(stateId?: number) {
  return useQuery({
    queryKey: ["cities", stateId],
    queryFn: () => LocationService.listCitiesByState(stateId!),
    enabled: !!stateId,
  });
}

export function useFetchCityById(cityId?: number) {
  return useQuery({
    queryKey: ["city", cityId],
    queryFn: () => LocationService.fetchCityById(cityId!),
    enabled: !!cityId,
  });
}

export function useSearchCitiesByName(name: string, stateId?: number) {
  return useQuery({
    queryKey: ["cities-name", name, stateId],
    queryFn: () => LocationService.searchCitiesByName(name, stateId),
    enabled: !!name,
  });
}
