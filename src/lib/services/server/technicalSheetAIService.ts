import type { SupabaseClient } from "@supabase/supabase-js";
import { TechnicalSheetAICacheEntity } from "@/types/database/technical-sheet";

interface CacheLookupParams {
  dishName: string;
  servings: number;
}

/**
 * Serviço backend para cache de respostas de ficha técnica geradas por IA.
 */
export class TechnicalSheetAIService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getCachedResponse({
    dishName,
    servings,
  }: CacheLookupParams): Promise<TechnicalSheetAICacheEntity | null> {
    const { data, error } = await this.supabase
      .from("technical_sheet_ai_cache")
      .select("*")
      .eq("dish_name", dishName)
      .eq("servings", servings)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error) {
      throw new Error(error.message || "Error while reading AI cache");
    }

    return (data as TechnicalSheetAICacheEntity) ?? null;
  }

  async saveResponse({
    dishName,
    servings,
    response,
  }: CacheLookupParams & { response: unknown }): Promise<void> {
    const { error } = await this.supabase
      .from("technical_sheet_ai_cache")
      .insert({
        dish_name: dishName,
        servings,
        json_response: response,
      });

    if (error) {
      throw new Error(error.message || "Error while saving AI cache");
    }
  }
}
