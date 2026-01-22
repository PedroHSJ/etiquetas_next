/**
 * Database Entity for stock_in_transit table
 */
export interface StockInTransitEntity {
  id: string;
  product_id: number;
  quantity: number;
  unit_of_measure_code: string;
  manufacturing_date: string | null;
  expiry_date: string | null;
  organization_id: string;
  user_id: string;
  observations: string | null;
  created_at: string;
  updated_at: string;
}
