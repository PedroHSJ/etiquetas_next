/**
 * Frontend Product Models
 */

/**
 * Product Group model for frontend
 */
export interface ProductGroup {
  id: number;
  name: string;
  description: string | null;
  organizationId: string | null;
  isActive: boolean;
}

/**
 * Product model for frontend
 */
export interface Product {
  id: number;
  name: string;
  groupId: number | null;
  organizationId: string | null;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  group?: ProductGroup;
}

/**
 * Product stats model for frontend
 */
export interface ProductStats {
  totalProducts: number;
  totalGroups: number;
  productsByGroup: Array<{
    group: string;
    count: number;
    percentage?: number;
  }>;
}
