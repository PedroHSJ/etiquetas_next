import { StateDto } from "./state";

/**
 * City DTO (Data Transfer Object)
 * Used for API communication
 * Uses camelCase and ISO string dates
 */
export interface CityDto {
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
}

/**
 * City with State DTO
 */
export interface CityWithStateDto extends CityDto {
  state: StateDto;
}

/**
 * Response from city creation/search API
 */
export interface CityResponseDto {
  id: number;
  name: string;
  state: {
    id: number;
    code: string;
    name: string;
  };
}
