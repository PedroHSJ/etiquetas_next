/**
 * Location Models - Frontend representation with Date objects
 */

/**
 * State Model
 */
export interface State {
  id: number;
  code: string;
  name: string;
  region: string;
  createdAt: Date;
}

/**
 * City Model
 */
export interface City {
  id: number;
  stateId: number;
  ibgeCode: string | null;
  name: string;
  zipCodeStart: string | null;
  zipCodeEnd: string | null;
  latitude: number | null;
  longitude: number | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * City with state relationship
 */
export interface CityWithState extends City {
  state?: State;
}
