/**
 * Product API Response DTOs
 */

/**
 * Product group response
 */
export interface ProductGroupResponseDto {
  id: number;
  name: string;
  description: string | null;
  organizationId: string | null;
  isActive: boolean;
}

/**
 * Product response
 */
export interface ProductResponseDto {
  id: number;
  name: string;
  groupId: number | null;
  organizationId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  group?: ProductGroupResponseDto;
}

/**
 * Product list response
 */
export interface ProductListResponseDto {
  success: boolean;
  data: ProductResponseDto[];
  error?: string;
}

/**
 * Product stats response
 */
export interface ProductStatsResponseDto {
  totalProducts: number;
  totalGroups: number;
  productsByGroup: Array<{
    group: string;
    count: number;
  }>;
}
