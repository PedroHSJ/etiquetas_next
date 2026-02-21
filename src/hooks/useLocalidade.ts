import { useQuery, useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { LocationService } from "@/lib/services/client/localidade-service";
import { CityWithState } from "@/types/models/location";
import { ViaCepResponseDto } from "@/types/dto/location/response";

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

/**
 * Legacy helper hook used by example components
 */
export function useLocalidade() {
  const [loading, setLoading] = useState(false);

  const buscarCEP = async (cep: string): Promise<ViaCepResponseDto | null> => {
    try {
      setLoading(true);
      return await LocationService.fetchCEP(cep);
    } finally {
      setLoading(false);
    }
  };

  const buscarOuCriarMunicipioPorCEP = async (cep: string) => {
    try {
      setLoading(true);
      const municipio = await LocationService.fetchOrCreateCity(cep);
      const dadosCEP = await LocationService.fetchCEP(cep);
      return { municipio, dadosCEP };
    } finally {
      setLoading(false);
    }
  };

  const validarCEP = (cep: string) => LocationService.validateCEP(cep);
  const formatarCEP = (cep: string) => LocationService.formatCEP(cep);

  return {
    buscarCEP,
    buscarOuCriarMunicipioPorCEP,
    validarCEP,
    formatarCEP,
    loading,
  };
}
