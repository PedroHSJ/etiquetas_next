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
  unitOfMeasureCode?: UnitOfMeasureCode;
  currentQuantity?: number;
}

export interface StockResponseDto {
  id: string;
  productId: number;
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

export interface QuickEntryResponseDto {
  message: string;
  movement: StockMovementResponseDto;
  updatedStock?: StockResponseDto;
}
