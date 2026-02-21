/**
 * Technical sheet database entities - Updated to camelCase to match Prisma @map schema
 */

export interface TechnicalSheetEntity {
  id: string;
  dishName: string;
  servings: number;
  preparationTime?: string | null;
  cookingTime?: string | null;
  difficulty?: string | null;
  preparationSteps?: string[] | null;
  nutritionalInsights?: Record<string, unknown> | null;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  active?: boolean | null;
}

export interface TechnicalSheetIngredientEntity {
  id: string;
  technicalSheetId: string;
  ingredientName: string;
  quantity: string;
  unit: string;
  originalQuantity: string;
  productId?: number | null;
  sortOrder: number;
  createdAt: string;
}

export interface TechnicalSheetAICacheEntity {
  id: string;
  dishName: string;
  servings: number;
  jsonResponse: Record<string, unknown>;
  createdAt: string;
}
