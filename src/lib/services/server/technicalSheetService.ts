import { prisma } from "@/lib/prisma";

/**
 * Service layer for technical sheets.
 * Converters removed as per new guideline.
 * Prisma already provides camelCase fields due to @map in schema.
 */
export class TechnicalSheetBackendService {
  constructor() {}

  async list({
    page,
    pageSize,
    organizationId,
    difficulty,
    active = true,
  }: {
    page: number;
    pageSize: number;
    organizationId: string;
    difficulty?: string;
    active?: boolean;
  }): Promise<any> {
    const skip = (page - 1) * pageSize;

    const where: any = {
      organizationId: organizationId,
      active,
    };

    if (difficulty) {
      where.difficulty = difficulty;
    }

    const [data, count] = await Promise.all([
      prisma.technical_sheets.findMany({
        where,
        include: {
          technical_sheet_ingredients: {
            orderBy: { sortOrder: "asc" },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.technical_sheets.count({ where }),
    ]);

    return {
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  async getById(
    id: string,
    organizationId: string,
    includeInactive = false,
  ): Promise<any | null> {
    const where: any = {
      id,
      organizationId: organizationId,
    };

    if (!includeInactive) {
      where.active = true;
    }

    return prisma.technical_sheets.findFirst({
      where,
      include: {
        technical_sheet_ingredients: {
          orderBy: { sortOrder: "asc" },
        },
      },
    });
  }

  async create(dto: any, userId: string): Promise<any> {
    const result = await prisma.$transaction(async (tx: any) => {
      const sheet = await tx.technical_sheets.create({
        data: {
          dishName: dto.dishName,
          servings: dto.servings,
          preparationTime: dto.preparationTime,
          cookingTime: dto.cookingTime,
          difficulty: dto.difficulty,
          preparationSteps: dto.preparationSteps,
          nutritionalInsights: dto.nutritionalInsights as any,
          organizationId: dto.organizationId,
          createdBy: userId,
          active: dto.active ?? true,
        },
      });

      if (dto.ingredients?.length) {
        await tx.technical_sheet_ingredients.createMany({
          data: dto.ingredients.map((ingredient: any, index: number) => ({
            technicalSheetId: sheet.id,
            ingredientName: ingredient.ingredientName,
            quantity: ingredient.quantity,
            unit: ingredient.unit,
            originalQuantity: ingredient.originalQuantity,
            productId: ingredient.productId,
            sortOrder: ingredient.sortOrder ?? index,
          })),
        });
      }

      return await tx.technical_sheets.findUnique({
        where: { id: sheet.id },
        include: { technical_sheet_ingredients: true },
      });
    });

    if (!result) throw new Error("Error creating technical sheet");
    return result;
  }

  async update(id: string, dto: any): Promise<any> {
    const result = await prisma.$transaction(async (tx: any) => {
      const updatePayload: any = { ...dto };
      delete updatePayload.ingredients; // We handle ingredients separately

      updatePayload.updatedAt = new Date();

      await tx.technical_sheets.update({
        where: { id },
        data: updatePayload,
      });

      if (dto.ingredients) {
        await tx.technical_sheet_ingredients.deleteMany({
          where: { technicalSheetId: id },
        });

        if (dto.ingredients.length) {
          await tx.technical_sheet_ingredients.createMany({
            data: dto.ingredients.map((ingredient: any, index: number) => ({
              technicalSheetId: id,
              ingredientName: ingredient.ingredientName,
              quantity: ingredient.quantity,
              unit: ingredient.unit,
              originalQuantity: ingredient.originalQuantity,
              productId: ingredient.productId,
              sortOrder: ingredient.sortOrder ?? index,
            })),
          });
        }
      }

      return await tx.technical_sheets.findUnique({
        where: { id },
        include: { technical_sheet_ingredients: true },
      });
    });

    if (!result) throw new Error("Technical sheet not found after update");
    return result;
  }

  async delete(id: string, organizationId: string): Promise<void> {
    await prisma.technical_sheets.update({
      where: { id, organizationId: organizationId },
      data: { active: false, updatedAt: new Date() },
    });
  }
}
