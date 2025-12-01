/**
 * Technical sheet database entities (snake_case)
 */

export interface TechnicalSheetEntity {
  id: string;
  dish_name: string;
  servings: number;
  preparation_time?: string | null;
  cooking_time?: string | null;
  difficulty?: string | null;
  preparation_steps?: string[] | null;
  nutritional_insights?: Record<string, any> | null;
  organization_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  active?: boolean | null;
}

export interface TechnicalSheetIngredientEntity {
  id: string;
  technical_sheet_id: string;
  ingredient_name: string;
  quantity: string;
  unit: string;
  original_quantity: string;
  product_id?: number | null;
  sort_order: number;
  created_at: string;
}

export interface TechnicalSheetAICacheEntity {
  id: string;
  dish_name: string;
  servings: number;
  json_response: Record<string, any>;
  created_at: string;
}
