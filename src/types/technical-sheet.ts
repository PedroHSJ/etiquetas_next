export interface IngredientSuggestion {
  name: string;
  quantity: string;
  unit: string;
}

export interface TechnicalSheetRequest {
  dishName: string;
  servings: number;
}

export interface TechnicalSheetResponse {
  dishName: string;
  servings: number;
  ingredients: IngredientSuggestion[];
  preparationTime?: string;
  cookingTime?: string;
  difficulty?: "fácil" | "médio" | "difícil";
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

export interface TechnicalSheet {
  id: string;
  dishName: string;
  servings: number;
  ingredients: EditableIngredient[];
  preparationTime?: string;
  cookingTime?: string;
  difficulty?: "fácil" | "médio" | "difícil";
  preparationSteps?: string[];
  nutritionalInsights?: {
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    fiber: string;
    highlights: string[];
  };
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}
