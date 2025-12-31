/**
 * Location Service - Backend service for states and cities
 * Returns database entities (snake_case)
 */

import type { StateEntity, CityEntity } from "@/types/database/location";
import { SupabaseClient } from "@supabase/supabase-js";

export class LocationService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Get all Brazilian states
   */
  async getAllStates(): Promise<StateEntity[]> {
    const { data, error } = await this.supabase
      .from("states")
      .select("*")
      .order("name");

    if (error) {
      console.error("Error fetching states:", error);
      throw new Error("Failed to fetch states");
    }

    return data || [];
  }

  /**
   * Get state by ID
   */
  async getStateById(stateId: number): Promise<StateEntity | null> {
    const { data, error } = await this.supabase
      .from("states")
      .select("*")
      .eq("id", stateId)
      .single();

    if (error) {
      console.error("Error fetching state:", error);
      return null;
    }

    return data;
  }

  /**
   * Get state by code (UF)
   */
  async getStateByCode(code: string): Promise<StateEntity | null> {
    const { data, error } = await this.supabase
      .from("states")
      .select("*")
      .eq("code", code.toUpperCase())
      .single();

    if (error) {
      console.error("Error fetching state by code:", error);
      return null;
    }

    return data;
  }

  /**
   * Get all cities from a specific state
   */
  async getCitiesByState(stateId: number): Promise<CityEntity[]> {
    const { data, error } = await this.supabase
      .from("cities")
      .select("*")
      .eq("state_id", stateId)
      .order("name");

    if (error) {
      console.error("Error fetching cities:", error);
      throw new Error("Failed to fetch cities");
    }

    return data || [];
  }

  /**
   * Get city by ID with state information
   */
  async getCityById(cityId: number): Promise<CityEntity | null> {
    const { data, error } = await this.supabase
      .from("cities")
      .select(
        `
        *,
        state:states(*)
      `
      )
      .eq("id", cityId)
      .single();

    if (error) {
      console.error("Error fetching city:", error);
      return null;
    }

    return data || null;
  }

  /**
   * Search cities by name (optionally filter by state)
   */
  async searchCitiesByName(
    name: string,
    stateId?: number
  ): Promise<CityEntity[]> {
    let query = this.supabase
      .from("cities")
      .select("*")
      .ilike("name", `%${name}%`)
      .order("name")
      .limit(50);

    if (stateId) {
      query = query.eq("state_id", stateId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error searching cities:", error);
      throw new Error("Failed to search cities");
    }

    return data || [];
  }

  /**
   * Get or create state by IBGE code (first 2 digits)
   */
  async getOrCreateStateByIbge(
    stateCode: string,
    stateName?: string
  ): Promise<StateEntity | null> {
    const code = stateCode.toUpperCase();

    // First, try to find existing state by code
    const { data: existingState } = await this.supabase
      .from("states")
      .select("*")
      .eq("code", code)
      .single();

    if (existingState) {
      return existingState;
    }

    // State doesn't exist, create it with full name
    const { data: newState, error } = await this.supabase
      .from("states")
      .insert({
        code,
        name: stateName || this.getStateNameByCode(code),
        region: this.getRegionByStateCode(code),
      })
      .select()
      .single();

    if (error) {
      console.error("Error creating state:", error);
      throw new Error("Failed to create state");
    }

    return newState;
  }

  /**
   * Helper to get region by state code
   */
  private getRegionByStateCode(code: string): string {
    const regions: Record<string, string> = {
      // Norte
      AC: "Norte",
      AM: "Norte",
      AP: "Norte",
      PA: "Norte",
      RO: "Norte",
      RR: "Norte",
      TO: "Norte",
      // Nordeste
      AL: "Nordeste",
      BA: "Nordeste",
      CE: "Nordeste",
      MA: "Nordeste",
      PB: "Nordeste",
      PE: "Nordeste",
      PI: "Nordeste",
      RN: "Nordeste",
      SE: "Nordeste",
      // Centro-Oeste
      DF: "Centro-Oeste",
      GO: "Centro-Oeste",
      MT: "Centro-Oeste",
      MS: "Centro-Oeste",
      // Sudeste
      ES: "Sudeste",
      MG: "Sudeste",
      RJ: "Sudeste",
      SP: "Sudeste",
      // Sul
      PR: "Sul",
      RS: "Sul",
      SC: "Sul",
    };
    return regions[code.toUpperCase()] || "Desconhecida";
  }

  /**
   * Helper to get full state name by code
   */
  private getStateNameByCode(code: string): string {
    const stateNames: Record<string, string> = {
      AC: "Acre",
      AL: "Alagoas",
      AP: "Amapá",
      AM: "Amazonas",
      BA: "Bahia",
      CE: "Ceará",
      DF: "Distrito Federal",
      ES: "Espírito Santo",
      GO: "Goiás",
      MA: "Maranhão",
      MT: "Mato Grosso",
      MS: "Mato Grosso do Sul",
      MG: "Minas Gerais",
      PA: "Pará",
      PB: "Paraíba",
      PR: "Paraná",
      PE: "Pernambuco",
      PI: "Piauí",
      RJ: "Rio de Janeiro",
      RN: "Rio Grande do Norte",
      RS: "Rio Grande do Sul",
      RO: "Rondônia",
      RR: "Roraima",
      SC: "Santa Catarina",
      SP: "São Paulo",
      SE: "Sergipe",
      TO: "Tocantins",
    };
    return stateNames[code.toUpperCase()] || code;
  }

  /**
   * Get or create city from IBGE code
   */
  async getOrCreateCityByIBGE(
    ibgeCode: string,
    cityData: {
      name: string;
      state_code: string;
      state_name?: string;
      zip_code?: string;
    }
  ): Promise<CityEntity | null> {
    // First, try to find existing city by IBGE code
    const { data: existingCity } = await this.supabase
      .from("cities")
      .select(
        `
        *,
        state:states(*)
      `
      )
      .eq("ibge_code", ibgeCode)
      .single();

    if (existingCity) {
      return existingCity;
    }

    // Get or create state
    const state = await this.getOrCreateStateByIbge(
      cityData.state_code,
      cityData.state_name
    );

    if (!state) {
      console.error("Failed to get or create state:", cityData.state_code);
      throw new Error("Failed to get or create state");
    }

    // Create new city
    const { data: newCity, error } = await this.supabase
      .from("cities")
      .insert({
        state_id: state.id,
        ibge_code: ibgeCode,
        name: cityData.name,
        zip_code_start: cityData.zip_code || null,
      })
      .select(
        `
        *,
        state:states(*)
      `
      )
      .single();

    if (error) {
      console.error("Error creating city:", error);
      throw new Error("Failed to create city");
    }

    return newCity;
  }
}
