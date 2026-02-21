import { prisma } from "@/lib/prisma";
import { TechnicalSheetAICacheEntity } from "@/types/database/technical-sheet";

interface CacheLookupParams {
  dishName: string;
  servings: number;
}

/**
 * Serviço backend para cache de respostas de ficha técnica geradas por IA.
 * Atualizado para usar camelCase conforme Prisma schema.
 */
export class TechnicalSheetAIService {
  constructor() {}

  async getCachedResponse({
    dishName,
    servings,
  }: CacheLookupParams): Promise<TechnicalSheetAICacheEntity | null> {
    const data = await prisma.technical_sheet_ai_cache.findUnique({
      where: {
        dishName_servings: {
          dishName: dishName,
          servings: servings,
        },
      },
    });

    if (!data) {
      return null;
    }

    return {
      id: data.id,
      dishName: data.dishName,
      servings: data.servings,
      jsonResponse: data.jsonResponse as Record<string, unknown>,
      createdAt: data.createdAt.toISOString(),
    };
  }

  async saveResponse({
    dishName,
    servings,
    response,
  }: CacheLookupParams & { response: unknown }): Promise<void> {
    await prisma.technical_sheet_ai_cache.upsert({
      where: {
        dishName_servings: {
          dishName: dishName,
          servings: servings,
        },
      },
      update: {
        jsonResponse: response as any,
      },
      create: {
        dishName: dishName,
        servings: servings,
        jsonResponse: response as any,
      },
    });
  }
}
