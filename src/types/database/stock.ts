/**
 * Stock-related database entities
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
  organization_id?: string | null;
  unit_of_measure_code: string;
  current_quantity: number;
  userId: string;
  created_at: string;
  updated_at: string;
}

/**
 * stock_movements table
 */
export interface StockMovementEntity {
  id: string;
  productId: number;
  organization_id?: string | null;
  userId: string;
  movement_type: "ENTRADA" | "SAIDA";
  quantity: number;
  unit_of_measure_code: string;
  observation: string | null;
  movement_date: string;
  created_at: string;
}
