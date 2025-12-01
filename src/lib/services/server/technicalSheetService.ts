import type { SupabaseClient } from "@supabase/supabase-js";
import {
  CreateTechnicalSheetDto,
  UpdateTechnicalSheetDto,
} from "@/types/dto/technical-sheet/request";
import {
  TechnicalSheetListResponseDto,
  TechnicalSheetResponseDto,
} from "@/types/dto/technical-sheet/response";
import {
  TechnicalSheetEntity,
  TechnicalSheetIngredientEntity,
} from "@/types/database/technical-sheet";
import { toTechnicalSheetResponseDto } from "@/lib/converters/technical-sheet";

interface ListParams {
  page: number;
  pageSize: number;
  organizationId: string;
  difficulty?: string;
  active?: boolean;
}

export class TechnicalSheetBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list({
    page,
    pageSize,
    organizationId,
    difficulty,
    active = true,
  }: ListParams): Promise<TechnicalSheetListResponseDto> {
    const offset = (page - 1) * pageSize;

    let query = this.supabase
      .from("technical_sheets")
      .select(
        `
        *,
        ingredients:technical_sheet_ingredients(*)
      `,
        { count: "exact" }
      )
      .eq("organization_id", organizationId)
      .eq("active", active)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (difficulty) {
      query = query.eq("difficulty", difficulty);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message || "Error while fetching technical sheets");
    }

    const items =
      (data as (TechnicalSheetEntity & {
        ingredients?: TechnicalSheetIngredientEntity[];
      })[]) || [];

    return {
      data: items.map(toTechnicalSheetResponseDto),
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  async getById(
    id: string,
    organizationId: string,
    includeInactive = false
  ): Promise<TechnicalSheetResponseDto | null> {
    let query = this.supabase
      .from("technical_sheets")
      .select(
        `
        *,
        ingredients:technical_sheet_ingredients(*)
      `
      )
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (!includeInactive) {
      query = query.eq("active", true);
    }

    const { data, error } = await query.single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(error.message || "Error while fetching technical sheet");
    }

    return toTechnicalSheetResponseDto(
      data as TechnicalSheetEntity & { ingredients?: TechnicalSheetIngredientEntity[] }
    );
  }

  async create(
    dto: CreateTechnicalSheetDto,
    userId: string
  ): Promise<TechnicalSheetResponseDto> {
    const { data, error } = await this.supabase
      .from("technical_sheets")
      .insert({
        dish_name: dto.dishName,
        servings: dto.servings,
        preparation_time: dto.preparationTime,
        cooking_time: dto.cookingTime,
        difficulty: dto.difficulty,
        preparation_steps: dto.preparationSteps,
        nutritional_insights: dto.nutritionalInsights,
        organization_id: dto.organizationId,
        created_by: userId,
        active: dto.active ?? true,
      })
      .select()
      .single();

    if (error || !data) {
      throw new Error(error?.message || "Error while creating technical sheet");
    }

    if (dto.ingredients?.length) {
      const ingredientRows = dto.ingredients.map(
        (ingredient, index): Omit<TechnicalSheetIngredientEntity, "id"> => ({
          technical_sheet_id: data.id,
          ingredient_name: ingredient.ingredientName,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          original_quantity: ingredient.originalQuantity,
          product_id: ingredient.productId,
          sort_order: ingredient.sortOrder ?? index,
          created_at: new Date().toISOString(),
        })
      );

      const { error: ingredientsError } = await this.supabase
        .from("technical_sheet_ingredients")
        .insert(ingredientRows);

      if (ingredientsError) {
        throw new Error(
          ingredientsError.message || "Error while saving ingredients"
        );
      }
    }

    const created = await this.getById(data.id, dto.organizationId);
    if (!created) {
      throw new Error("Error while loading created technical sheet");
    }

    return created;
  }

  async update(
    id: string,
    dto: UpdateTechnicalSheetDto
  ): Promise<TechnicalSheetResponseDto> {
    const updatePayload: Partial<TechnicalSheetEntity> = {};

    if (dto.dishName !== undefined) updatePayload.dish_name = dto.dishName;
    if (dto.servings !== undefined) updatePayload.servings = dto.servings;
    if (dto.preparationTime !== undefined)
      updatePayload.preparation_time = dto.preparationTime;
    if (dto.cookingTime !== undefined)
      updatePayload.cooking_time = dto.cookingTime;
    if (dto.difficulty !== undefined) updatePayload.difficulty = dto.difficulty;
    if (dto.preparationSteps !== undefined)
      updatePayload.preparation_steps = dto.preparationSteps;
    if (dto.nutritionalInsights !== undefined)
      updatePayload.nutritional_insights = dto.nutritionalInsights;
    if (dto.active !== undefined) updatePayload.active = dto.active;

    const { error } = await this.supabase
      .from("technical_sheets")
      .update(updatePayload)
      .eq("id", id)
      .eq("organization_id", dto.organizationId);

    if (error) {
      throw new Error(error.message || "Error while updating technical sheet");
    }

    if (dto.ingredients) {
      const { error: deleteError } = await this.supabase
        .from("technical_sheet_ingredients")
        .delete()
        .eq("technical_sheet_id", id);

      if (deleteError) {
        throw new Error(
          deleteError.message || "Error while updating ingredients"
        );
      }

      if (dto.ingredients.length) {
        const ingredientRows = dto.ingredients.map(
          (ingredient, index): Omit<TechnicalSheetIngredientEntity, "id"> => ({
            technical_sheet_id: id,
            ingredient_name: ingredient.ingredientName,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            original_quantity: ingredient.originalQuantity,
            product_id: ingredient.productId,
            sort_order: ingredient.sortOrder ?? index,
            created_at: new Date().toISOString(),
          })
        );

        const { error: insertError } = await this.supabase
          .from("technical_sheet_ingredients")
          .insert(ingredientRows);

        if (insertError) {
          throw new Error(
            insertError.message || "Error while updating ingredients"
          );
        }
      }
    }

    const updated = await this.getById(
      id,
      dto.organizationId,
      dto.active === false
    );
    if (!updated) {
      throw new Error("Technical sheet not found after update");
    }

    return updated;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    const { error } = await this.supabase
      .from("technical_sheets")
      .update({ active: false })
      .eq("id", id)
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error(error.message || "Error while deleting technical sheet");
    }
  }
}
