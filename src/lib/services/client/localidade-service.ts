import { api } from "@/lib/apiClient";
import { ApiResponse, ApiSuccessResponse } from "@/types/common";
import {
  CityCreationResponseDto,
  CityResponseDto,
  StateResponseDto,
  ViaCepResponseDto,
} from "@/types/dto/location/response";
import {
  CreateCityFromZipCodeDto,
  SearchCitiesByNameDto,
} from "@/types/dto/location/request";
import {
  toCityFromCreationDto,
  toCityModel,
  toCityWithStateModel,
  toStateModel,
} from "@/lib/converters/location";
import { City, CityWithState, State } from "@/types/models/location";
import axios from "axios";

const API_BASE = "/location";

export const LocationService = {
  async fetchCEP(cep: string): Promise<ViaCepResponseDto | null> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) throw new Error("CEP must have 8 digits");
    const { data } = await axios.get<ViaCepResponseDto>(
      `https://viacep.com.br/ws/${cleanCep}/json/`
    );
    if (!data || "erro" in data) return null;
    return data;
  },

  async fetchOrCreateCity(cep: string): Promise<CityWithState | null> {
    const payload: CreateCityFromZipCodeDto = { cep: cep.replace(/\D/g, "") };
    const { data } = await api.post<
      CityCreationResponseDto | ApiSuccessResponse<CityCreationResponseDto>
    >(`${API_BASE}/city`, payload);

    const dto =
      (data as ApiSuccessResponse<CityCreationResponseDto>)?.data ||
      (data as CityCreationResponseDto | undefined);

    if (!dto) return null;

    return toCityFromCreationDto(dto);
  },

  async listStates(): Promise<State[]> {
    const { data } = await api.get<
      ApiResponse<StateResponseDto[]> | StateResponseDto[]
    >(`${API_BASE}/states`);

    const states =
      Array.isArray(data) && !(data as ApiResponse<StateResponseDto[]>).data
        ? data
        : (data as ApiResponse<StateResponseDto[]>)?.data || [];

    return states.map(toStateModel);
  },

  async listCitiesByState(stateId: number): Promise<City[]> {
    const { data } = await api.get<
      ApiResponse<CityResponseDto[]> | CityResponseDto[]
    >(`${API_BASE}/states/${stateId}/cities`);

    const cities =
      Array.isArray(data) && !(data as ApiResponse<CityResponseDto[]>).data
        ? data
        : (data as ApiResponse<CityResponseDto[]>)?.data || [];

    return cities.map(toCityModel);
  },

  async fetchCityById(cityId: number): Promise<CityWithState | null> {
    const { data } = await api.get<ApiSuccessResponse<CityResponseDto>>(
      `${API_BASE}/cities/${cityId}`
    );

    if (!data?.data) return null;
    return toCityWithStateModel(data.data);
  },

  async searchCitiesByName(name: string, stateId?: number): Promise<City[]> {
    const params: SearchCitiesByNameDto = { name };
    if (stateId) params.stateId = stateId;

    const { data } = await api.get<
      ApiResponse<CityResponseDto[]> | CityResponseDto[]
    >(`${API_BASE}/cities`, {
      params,
    });

    const cities =
      Array.isArray(data) && !(data as ApiResponse<CityResponseDto[]>).data
        ? data
        : (data as ApiResponse<CityResponseDto[]>)?.data || [];

    return cities.map(toCityModel);
  },

  validateCEP(cep: string): boolean {
    const cleanCep = cep.replace(/\D/g, "");
    return cleanCep.length === 8;
  },

  formatCEP(cep: string): string {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length === 8) {
      return `${cleanCep.slice(0, 5)}-${cleanCep.slice(5)}`;
    }
    return cep;
  },
};
