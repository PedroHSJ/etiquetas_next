/**
 * Stock-related database entities - Updated to camelCase to match Prisma @map schema
 */

/**
 * unit_of_measure table
 */
export interface UnitOfMeasureEntity {
  code: string;
  description: string;
}

/**
 * stock table
 */
export interface StockEntity {
  id: string;
  productId: number;
  organizationId?: string | null;
  unitOfMeasureCode: string;
  currentQuantity: number;
  userId: string;
  storageLocationId?: string | null;
  createdAt: string;
  updatedAt: string;
}

/**
 * stock_movements table
 */
export interface StockMovementEntity {
  id: string;
  productId: number;
  organizationId?: string | null;
  userId: string;
  movementType: "ENTRADA" | "SAIDA";
  quantity: number;
  unitOfMeasureCode: string;
  observation: string | null;
  storageLocationId?: string | null;
  movementDate: string;
  createdAt: string;
}
