/**
 * Response DTOs for Stock In Transit
 */
import { ProductStockResponseDto } from "../stock/response";

export interface StockInTransitResponseDto {
  id: string;
  productId: number;
  quantity: number;
  unitOfMeasureCode: string;
  manufacturingDate: string | null;
  expiryDate: string | null;
  organizationId: string;
  userId: string;
  observations: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  product?: ProductStockResponseDto;
}

export interface StockInTransitListResponseDto {
  success: boolean;
  data: StockInTransitResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
