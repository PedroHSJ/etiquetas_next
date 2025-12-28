import {
  TechnicalSheetEntity,
  TechnicalSheetIngredientEntity,
} from "@/types/database/technical-sheet";
import {
  TechnicalSheetResponseDto,
  TechnicalSheetIngredientResponseDto,
} from "@/types/dto/technical-sheet/response";
import { TechnicalSheetModel } from "@/types/models/technical-sheet";

const mapIngredientToResponse = (
  ingredient: TechnicalSheetIngredientEntity
): TechnicalSheetIngredientResponseDto => ({
  id: ingredient.id,
  ingredientName: ingredient.ingredient_name,
  quantity: ingredient.quantity,
  unit: ingredient.unit,
  originalQuantity: ingredient.original_quantity,
  productId: ingredient.product_id ?? null,
  sortOrder: ingredient.sort_order,
  createdAt: ingredient.created_at,
});

export const toTechnicalSheetResponseDto = (
  entity: TechnicalSheetEntity & {
    ingredients?: TechnicalSheetIngredientEntity[];
  }
): TechnicalSheetResponseDto => ({
  id: entity.id,
  dishName: entity.dish_name,
  servings: entity.servings,
  preparationTime: entity.preparation_time ?? null,
  cookingTime: entity.cooking_time ?? null,
  difficulty: entity.difficulty ?? null,
  preparationSteps: entity.preparation_steps ?? undefined,
  nutritionalInsights: entity.nutritional_insights ?? null,
  organizationId: entity.organization_id,
  createdBy: entity.created_by,
  createdAt: entity.created_at,
  updatedAt: entity.updated_at,
  active: entity.active ?? true,
  ingredients: (entity.ingredients ?? [])
    .map(mapIngredientToResponse)
    .sort((a, b) => a.sortOrder - b.sortOrder),
});

export const toTechnicalSheetModel = (
  dto:
    | TechnicalSheetResponseDto
    | (TechnicalSheetEntity & {
        ingredients?: TechnicalSheetIngredientEntity[];
      })
): TechnicalSheetModel => {
  const baseDto =
    "dishName" in dto
      ? dto
      : toTechnicalSheetResponseDto(
          dto as TechnicalSheetEntity & {
            ingredients?: TechnicalSheetIngredientEntity[];
          }
        );

  return {
    id: baseDto.id,
    dishName: baseDto.dishName,
    servings: baseDto.servings,
    preparationTime: baseDto.preparationTime ?? null,
    cookingTime: baseDto.cookingTime ?? null,
    difficulty: baseDto.difficulty ?? null,
    preparationSteps: baseDto.preparationSteps,
    nutritionalInsights: baseDto.nutritionalInsights ?? null,
    organizationId: baseDto.organizationId,
    createdBy: baseDto.createdBy,
    createdAt: new Date(baseDto.createdAt),
    updatedAt: new Date(baseDto.updatedAt),
    active: baseDto.active ?? true,
    ingredients: baseDto.ingredients.map((ingredient) => ({
      id: ingredient.id,
      name: ingredient.ingredientName,
      quantity: ingredient.quantity,
      unit: ingredient.unit,
      originalQuantity: ingredient.originalQuantity,
      productId: ingredient.productId ?? null,
      sortOrder: ingredient.sortOrder,
      createdAt: new Date(ingredient.createdAt),
    })),
  };
};
