/**
 * Location Service - Backend service for states and cities
 * Returns database entities (camelCase)
 */

import { prisma } from "@/lib/prisma";
import { cities, states } from "@prisma/client";

export class LocationService {
  /**
   * Get all Brazilian states
   */
  async getAllStates(): Promise<states[] | null> {
    const states = await prisma.states.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return states;
  }

  /**
   * Get state by ID
   */
  async getStateById(stateId: number): Promise<states | null> {
    const state = await prisma.states.findUnique({
      where: {
        id: stateId,
      },
    });

    return state ? state : null;
  }

  /**
   * Get state by code (UF)
   */
  async getStateByCode(code: string): Promise<states | null> {
    const state = await prisma.states.findUnique({
      where: {
        code: code.toUpperCase(),
      },
    });

    return state;
  }

  /**
   * Get all cities from a specific state
   */
  async getCitiesByState(stateId: number): Promise<cities[]> {
    const cities = await prisma.cities.findMany({
      where: {
        stateId: stateId,
      },
      orderBy: {
        name: "asc",
      },
    });

    return cities;
  }

  /**
   * Get city by ID with state information
   */
  async getCityById(cityId: number): Promise<cities | null> {
    const city = await prisma.cities.findUnique({
      where: {
        id: cityId,
      },
      include: {
        states: true,
      },
    });

    return city;
  }

  /**
   * Search cities by name (optionally filter by state)
   */
  async searchCitiesByName(name: string, stateId?: number): Promise<cities[]> {
    const cities = await prisma.cities.findMany({
      where: {
        name: {
          contains: name,
          mode: "insensitive", // ilike
        },
        ...(stateId ? { stateId: stateId } : {}),
      },
      orderBy: {
        name: "asc",
      },
      take: 50, // limit 50
    });

    return cities;
  }

  /**
   * Get or create state by IBGE code (first 2 digits)
   */
  async getOrCreateStateByIbge(
    stateCode: string,
    stateName?: string,
  ): Promise<states | null> {
    const code = stateCode.toUpperCase();

    const existingState = await prisma.states.findUnique({
      where: {
        code,
      },
    });

    if (existingState) {
      return existingState;
    }

    try {
      const newState = await prisma.states.create({
        data: {
          code,
          name: stateName || this.getStateNameByCode(code),
          region: this.getRegionByStateCode(code),
        },
      });
      return newState;
    } catch (error) {
      console.error("Error creating state:", error);
      const retryState = await prisma.states.findUnique({
        where: { code },
      });
      if (retryState) return retryState;

      throw new Error("Failed to create state");
    }
  }

  /**
   * Helper to get region by state code
   */
  private getRegionByStateCode(code: string): string {
    const regions: Record<string, string> = {
      AC: "Norte",
      AM: "Norte",
      AP: "Norte",
      PA: "Norte",
      RO: "Norte",
      RR: "Norte",
      TO: "Norte",
      AL: "Nordeste",
      BA: "Nordeste",
      CE: "Nordeste",
      MA: "Nordeste",
      PB: "Nordeste",
      PE: "Nordeste",
      PI: "Nordeste",
      RN: "Nordeste",
      SE: "Nordeste",
      DF: "Centro-Oeste",
      GO: "Centro-Oeste",
      MT: "Centro-Oeste",
      MS: "Centro-Oeste",
      ES: "Sudeste",
      MG: "Sudeste",
      RJ: "Sudeste",
      SP: "Sudeste",
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
    },
  ): Promise<cities | null> {
    const existingCity = await prisma.cities.findUnique({
      where: {
        ibgeCode,
      },
      include: {
        states: true,
      },
    });

    if (existingCity) {
      return existingCity;
    }

    const state = await this.getOrCreateStateByIbge(
      cityData.state_code,
      cityData.state_name,
    );

    if (!state) {
      throw new Error("Failed to get or create state");
    }

    try {
      const newCity = await prisma.cities.create({
        data: {
          stateId: state.id,
          ibgeCode: ibgeCode,
          name: cityData.name,
          zipCodeStart: cityData.zip_code || null,
        },
        include: {
          states: true,
        },
      });

      return newCity;
    } catch (error) {
      console.error("Error creating city:", error);
      const retryCity = await prisma.cities.findUnique({
        where: { ibgeCode },
        include: { states: true },
      });
      if (retryCity) return retryCity;

      throw new Error("Failed to create city");
    }
  }
}
