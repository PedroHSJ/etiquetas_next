/**
 * Frontend models for technical sheets (camelCase + Date objects)
 */

export interface IngredientSuggestion {
  name: string;
  quantity: string;
  unit: string;
}

export interface TechnicalSheetAIRequest {
  dishName: string;
  servings: number;
}

export interface TechnicalSheetAIResponse {
  dishName: string;
  servings: number;
  ingredients: IngredientSuggestion[];
  preparationTime?: string;
  cookingTime?: string;
  difficulty?: string;
  preparationSteps?: string[];
  nutritionalInsights?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    highlights: string[];
  };
}

export interface EditableIngredient extends IngredientSuggestion {
  id: string;
  productId?: string;
  isEditing: boolean;
  originalQuantity: string;
}

export interface TechnicalSheetIngredientModel {
  id: string;
  name: string;
  quantity: string;
  unit: string;
  originalQuantity: string;
  productId?: number | null;
  sortOrder: number;
  createdAt: Date;
}

export interface TechnicalSheetModel {
  id: string;
  dishName: string;
  servings: number;
  preparationTime?: string | null;
  cookingTime?: string | null;
  difficulty?: string | null;
  preparationSteps?: string[];
  nutritionalInsights?: Record<string, any> | null;
  organizationId: string;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  ingredients: TechnicalSheetIngredientModel[];
}

export interface TechnicalSheetListModel {
  data: TechnicalSheetModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
