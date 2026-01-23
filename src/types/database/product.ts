/**
 * Product and inventory database entities
 */

/**
 * products table
 */
export interface ProductEntity {
  id: number;
  name: string;
  group_id: number | null;
  organization_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

/**
 * labels table
 */
export interface LabelEntity {
  id: number;
  product_id: number | null;
  quantity: number;
  printed_at: string;
  user_id: string | null;
  organization_id: string | null;
  status: string;
  notes: string | null;
  created_at: string;
}
