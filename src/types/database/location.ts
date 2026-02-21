/**
 * Location database entities (states and cities)
 * Updated to camelCase to match Prisma @map schema
 */

/**
 * states table
 */
export interface StateEntity {
  id: number;
  code: string; // UF (SP, RJ, etc.)
  name: string;
  region: string;
  createdAt: string;
}

/**
 * cities table
 */
export interface CityEntity {
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
  state?: StateEntity;
}
