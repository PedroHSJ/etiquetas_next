/**
 * Stock API response DTOs
 */

import { MovementType, UnitOfMeasureCode } from "@/types/stock/stock";

export interface MovementUserDto {
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
}

export interface ProductStockResponseDto {
  id: number;
  name: string;
  groupId?: number | null;
  unitOfMeasureCode?: UnitOfMeasureCode | null;
  currentQuantity?: number | null;
}

export interface StockResponseDto {
  id: string;
  productId: number;
  organizationId?: string | null;
  currentQuantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  userId: string;
  createdAt: string;
  updatedAt: string;
  product?: ProductStockResponseDto;
}

export interface StockMovementResponseDto {
  id: string;
  productId: number;
  organizationId?: string | null;
  userId: string;
  movementType: MovementType;
  quantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  observation?: string | null;
  movementDate: string;
  createdAt: string;
  user?: MovementUserDto;
  product?: ProductStockResponseDto;
}

/**
 * Paginated list response for stock items
 */
export interface StockListResponseDto {
  data: StockResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

/**
 * Paginated list response for stock movements
 */
export interface MovementListResponseDto {
  data: StockMovementResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface QuickEntryResponseDto {
  message: string;
  movement: StockMovementResponseDto;
  updatedStock?: StockResponseDto;
}
