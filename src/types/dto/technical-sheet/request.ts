/**
 * Technical sheet request DTOs
 */

export interface TechnicalSheetIngredientRequestDto {
  ingredientName: string;
  quantity: string;
  unit: string;
  originalQuantity: string;
  productId?: number;
  sortOrder?: number;
}

export interface CreateTechnicalSheetDto {
  dishName: string;
  servings: number;
  preparationTime?: string;
  cookingTime?: string;
  difficulty?: string;
  preparationSteps?: string[];
  nutritionalInsights?: Record<string, any>;
  organizationId: string;
  ingredients?: TechnicalSheetIngredientRequestDto[];
  active?: boolean;
}

export interface UpdateTechnicalSheetDto
  extends Partial<Omit<CreateTechnicalSheetDto, "organizationId">> {
  organizationId: string;
}
