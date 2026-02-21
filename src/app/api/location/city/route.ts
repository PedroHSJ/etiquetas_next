import { NextResponse } from "next/server";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityCreationResponseDto } from "@/types/dto/location/response";
import { LocationService } from "@/lib/services/server/locationService";

/**
 * POST /api/location/city
 * Get or create a city by CEP
 */
export async function POST(request: Request) {
  try {
    const { cep } = await request.json();
    if (!cep) {
      const errorResponse: ApiErrorResponse = { error: "CEP is required" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Fetch CEP data from ViaCEP API
    const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
    if (!response.ok) {
      const errorResponse: ApiErrorResponse = { error: "Failed to fetch CEP" };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const cepData = await response.json();
    if (cepData.erro) {
      const errorResponse: ApiErrorResponse = { error: "CEP not found" };
      return NextResponse.json(errorResponse, { status: 404 });
    }

    const locationService = new LocationService();
    const city = await locationService.getOrCreateCityByIBGE(
      cepData.ibge || cep,
      {
        name: cepData.localidade,
        state_code: cepData.uf,
        zip_code: cep,
      },
    );

    if (!city) {
      const errorResponse: ApiErrorResponse = {
        error: "Failed to create/find city",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const stateData = (city as any).states;
    if (!stateData) {
      const errorResponse: ApiErrorResponse = {
        error: "Failed to find state for city",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const normalized: CityCreationResponseDto = {
      id: city.id,
      name: city.name,
      state: {
        id: stateData.id,
        code: stateData.code,
        name: stateData.name,
      },
    };

    const successResponse: ApiSuccessResponse<CityCreationResponseDto> = {
      data: normalized,
    };
    return NextResponse.json(successResponse);
  } catch (err: unknown) {
    console.error("Error in POST /api/location/city:", err);
    const errorResponse: ApiErrorResponse = {
      error: err instanceof Error ? err.message : "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
