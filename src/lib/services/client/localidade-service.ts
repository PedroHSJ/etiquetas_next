import axios from "axios";
import type {
  ViaCEPResponse,
  MunicipioResponse as CityResponse,
  Estado as State,
  Municipio as City,
} from "@/types/localidade";

const API_BASE = "/api/location";

export const LocationService = {
  async fetchCEP(cep: string): Promise<ViaCEPResponse | null> {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) throw new Error("CEP must have 8 digits");
    const { data } = await axios.get<ViaCEPResponse>(
      `https://viacep.com.br/ws/${cleanCep}/json/`
    );
    if (!data || (data as any).erro) return null;
    return data;
  },

  async fetchOrCreateCity(cep: string): Promise<CityResponse | null> {
    const cleanCep = cep.replace(/\D/g, "");
    const { data } = await axios.post<CityResponse>(`${API_BASE}/city`, {
      cep: cleanCep,
    });
    return data || null;
  },

  async listStates(): Promise<State[]> {
    const { data } = await axios.get<State[]>(`${API_BASE}/states`);
    return data || [];
  },

  async listCitiesByState(stateId: number): Promise<City[]> {
    const { data } = await axios.get<City[]>(
      `${API_BASE}/states/${stateId}/cities`
    );
    return data || [];
  },

  async fetchCityById(cityId: number): Promise<City | null> {
    const { data } = await axios.get<City>(`${API_BASE}/cities/${cityId}`);
    return data || null;
  },

  async searchCitiesByName(name: string, stateId?: number): Promise<City[]> {
    const params: { name: string; stateId?: number } = { name };
    if (stateId) params.stateId = stateId;
    const { data } = await axios.get<City[]>(`${API_BASE}/cities`, {
      params,
    });
    return data || [];
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
