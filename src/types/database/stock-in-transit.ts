/**
 * Database Entity for stock_in_transit table - Updated to camelCase to match Prisma @map schema
 */
export interface StockInTransitEntity {
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
}
