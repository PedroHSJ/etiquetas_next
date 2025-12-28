/**
 * Technical sheet response DTOs
 */

export interface TechnicalSheetIngredientResponseDto {
  id: string;
  ingredientName: string;
  quantity: string;
  unit: string;
  originalQuantity: string;
  productId?: number | null;
  sortOrder: number;
  createdAt: string;
}

export interface TechnicalSheetResponseDto {
  id: string;
  dishName: string;
  servings: number;
  preparationTime?: string | null;
  cookingTime?: string | null;
  difficulty?: string | null;
  preparationSteps?: string[];
  nutritionalInsights?: Record<string, unknown> | null;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  ingredients: TechnicalSheetIngredientResponseDto[];
  active?: boolean | null;
}

export interface TechnicalSheetListResponseDto {
  data: TechnicalSheetResponseDto[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
