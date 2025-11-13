/**
 * Location API Request DTOs
 */

/**
 * DTO for searching cities by ZIP code
 */
export interface SearchCityByZipCodeDto {
  zipCode: string;
}

/**
 * DTO for searching cities by name
 */
export interface SearchCitiesByNameDto {
  name: string;
  stateId?: number;
}

/**
 * DTO for creating/finding a city from ZIP code
 */
export interface CreateCityFromZipCodeDto {
  cep: string;
}
