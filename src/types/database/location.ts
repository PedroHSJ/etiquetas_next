/**
 * Location database entities (states and cities)
 */

/**
 * states table
 */
export interface StateEntity {
  id: number;
  code: string; // UF (SP, RJ, etc.)
  name: string;
  region: string;
  created_at: string;
}

/**
 * cities table
 */
export interface CityEntity {
  id: number;
  state_id: number;
  ibge_code: string | null;
  name: string;
  zip_code_start: string | null;
  zip_code_end: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
  state: StateEntity;
}
