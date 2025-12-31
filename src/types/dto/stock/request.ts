/**
 * Stock API Request DTOs
 */

import { MovementType, UnitOfMeasureCode } from "@/types/stock/stock";

/**
 * Filters for stock listing
 */
export interface ListStockFiltersDto {
  productName?: string;
  productId?: number;
  userId?: string;
  zeroStock?: boolean;
  lowStock?: boolean;
  minimumQuantity?: number;
}

/**
 * Request for listing stock items
 */
export interface ListStockRequestDto {
  page?: number;
  pageSize?: number;
  organizationId: string;
  filters?: ListStockFiltersDto;
}

/**
 * Filters for movements listing
 */
export interface ListMovementsFiltersDto {
  productId?: number;
  userId?: string;
  movementType?: MovementType;
  startDate?: string;
  endDate?: string;
  productName?: string;
}

/**
 * Request for listing stock movements
 */
export interface ListMovementsRequestDto {
  page?: number;
  pageSize?: number;
  organizationId: string;
  filters?: ListMovementsFiltersDto;
}

/**
 * Request for quick entry
 */
export interface QuickEntryRequestDto {
  productId: number;
  quantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  observation?: string;
  organizationId: string;
  storageLocationId?: string;
}

/**
 * Request for manual movement
 */
export interface CreateMovementRequestDto {
  productId: number;
  quantity: number;
  movementType: MovementType;
  unitOfMeasureCode: UnitOfMeasureCode;
  observation?: string;
  organizationId: string;
  storageLocationId?: string;
}
