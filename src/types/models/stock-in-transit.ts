/**
 * Frontend Model for Stock In Transit
 */
import { ProductStockModel } from "./stock";

export interface StockInTransit {
  id: string;
  productId: number;
  quantity: number;
  unitOfMeasureCode: string;
  manufacturingDate: Date | null;
  expiryDate: Date | null;
  organizationId: string;
  userId: string;
  observations: string | null;
  createdAt: Date;
  updatedAt: Date;

  // Relations
  product?: ProductStockModel;

  // Computed fields
  isExpired: boolean;
  daysRemaining: number | null;
}
