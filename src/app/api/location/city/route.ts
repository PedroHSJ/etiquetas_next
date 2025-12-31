import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { CityCreationResponseDto } from "@/types/dto/location/response";
import { LocationService } from "@/lib/services/server/locationService";

export async function POST(request: Request) {
  try {
    const { cep } = await request.json();
    if (!cep) {
      const errorResponse: ApiErrorResponse = { error: "CEP is required" };
      return NextResponse.json(errorResponse, { status: 400 });
    }

    // Use anon supabase-js client for server-side
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Busca dados do CEP na API ViaCEP
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

    // Usar o LocationService para criar/buscar cidade (e estado se necessário)
    const locationService = new LocationService(supabase);

    const city = await locationService.getOrCreateCityByIBGE(
      cepData.ibge || cep, // Use IBGE code or CEP as fallback
      {
        name: cepData.localidade,
        state_code: cepData.uf,
        state_name: undefined, // Will be resolved by getOrCreateStateByIbge
        zip_code: cep,
      }
    );

    if (!city) {
      const errorResponse: ApiErrorResponse = {
        error: "Failed to create/find city",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Normaliza resposta - o state vem do join com states
    const state = city.state as
      | { id: number; code: string; name: string; region?: string }
      | undefined;

    // Se por algum motivo o state não veio no join, busca separadamente
    let stateData = state;
    if (!stateData) {
      const fetchedState = await locationService.getStateByCode(cepData.uf);
      if (fetchedState) {
        stateData = {
          id: fetchedState.id,
          code: fetchedState.code,
          name: fetchedState.name,
          region: fetchedState.region,
        };
      }
    }

    if (!stateData) {
      const errorResponse: ApiErrorResponse = {
        error: "Failed to find state for city",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    const normalized: CityCreationResponseDto = {
      id: city.id,
      nome: city.name,
      estado: {
        id: stateData.id,
        codigo: stateData.code,
        nome: stateData.name,
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
