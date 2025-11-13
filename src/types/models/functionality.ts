/**
 * Functionality Model - Frontend representation with Date objects
 */
export interface Functionality {
  id: string;
  name: string;
  description: string | null;
  route: string | null;
  active: boolean;
  createdAt: Date;
}
