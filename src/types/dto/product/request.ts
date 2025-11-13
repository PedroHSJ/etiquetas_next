/**
 * Product API Request DTOs
 */

/**
 * DTO for creating a product
 */
export interface CreateProductDto {
  name: string;
  groupId?: number;
  organizationId: string;
}

/**
 * DTO for updating a product
 */
export interface UpdateProductDto {
  name?: string;
  groupId?: number;
  isActive?: boolean;
}

/**
 * DTO for searching products
 */
export interface SearchProductsDto {
  organizationId: string;
  query?: string;
  groupId?: number;
  isActive?: boolean;
}

/**
 * DTO for creating a product group
 */
export interface CreateProductGroupDto {
  name: string;
  description?: string;
  organizationId: string;
}

/**
 * DTO for updating a product group
 */
export interface UpdateProductGroupDto {
  name?: string;
  description?: string;
  isActive?: boolean;
}

/**
 * DTO for product stats query
 */
export interface ProductStatsQueryDto {
  organizationId: string;
}
