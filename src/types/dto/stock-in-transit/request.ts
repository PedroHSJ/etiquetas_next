/**
 * Request DTOs for Stock In Transit
 */

export interface CreateStockInTransitDto {
  productId: number;
  quantity: number;
  unitOfMeasureCode: string;
  manufacturingDate?: string; // ISO string
  expiryDate?: string; // ISO string
  observations?: string;
  organizationId?: string; // Usually from context
}

export interface UpdateStockInTransitDto {
  quantity?: number;
  manufacturingDate?: string;
  expiryDate?: string;
  observations?: string;
}
