/**
 * State DTO (Data Transfer Object)
 * Used for API communication
 * Uses camelCase and ISO string dates
 */
export interface StateDto {
  id: number;
  code: string; // UF (SP, RJ, etc.)
  name: string;
  region: string;
  createdAt: string;
}
