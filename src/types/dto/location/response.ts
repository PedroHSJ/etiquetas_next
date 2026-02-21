/**
 * Location API Response DTOs
 */

/**
 * State response
 */
export interface StateResponseDto {
  id: number;
  code: string;
  name: string;
  region: string;
  createdAt: string;
}

/**
 * City response
 */
export interface CityResponseDto {
  id: number;
  stateId: number;
  ibgeCode: string | null;
  name: string;
  zipCodeStart: string | null;
  zipCodeEnd: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: string;
  updatedAt: string;
  state?: StateResponseDto;
}

/**
 * ViaCEP API response
 */
export interface ViaCepResponseDto {
  cep: string;
  logradouro: string;
  complemento?: string;
  bairro: string;
  localidade: string;
  uf: string;
  ibge?: string;
  gia?: string;
  ddd?: string;
  siafi?: string;
  erro?: boolean;
}

/**
 * City creation response with state info
 */
export interface CityCreationResponseDto {
  id: number;
  name: string;
  state: {
    id: number;
    code: string;
    name: string;
  };
}
