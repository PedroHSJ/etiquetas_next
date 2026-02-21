import { prisma } from "@/lib/prisma";
import { EstoqueFiltros, MovimentacoesFiltros } from "@/types/estoque";
import {
  StockStatistics,
  STOCK_MESSAGES,
  UnitOfMeasureCode,
} from "@/types/stock/stock";
import type { Prisma } from "@prisma/client";

/**
 * Backend service responsible for stock operations using Prisma.
 * Removed converters to simplify architecture.
 */
export class StockBackendService {
  /**
   * List stock items with pagination and optional filters.
   */
  async listStock({
    page,
    pageSize,
    filters,
    organizationId,
  }: {
    page: number;
    pageSize: number;
    filters?: EstoqueFiltros;
    organizationId: string;
  }): Promise<any> {
    const skip = (page - 1) * pageSize;

    const where: Prisma.stockWhereInput = {
      organizationId: organizationId,
    };

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.estoque_zerado) {
      where.currentQuantity = 0;
    } else if (filters?.estoque_baixo) {
      const minimum = filters.quantidade_minima ?? 10;
      where.currentQuantity = {
        gt: 0,
        lt: minimum,
      };
    }

    if (filters?.produto_nome) {
      where.products = {
        name: {
          contains: filters.produto_nome,
          mode: "insensitive",
        },
      };
    }

    const [data, count] = await Promise.all([
      prisma.stock.findMany({
        where,
        include: {
          products: {
            select: {
              id: true,
              name: true,
              groupId: true,
            },
          },
          storage_locations: {
            select: {
              id: true,
              name: true,
              parentId: true,
            },
          },
        },
        orderBy: {
          updatedAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.stock.count({ where }),
    ]);

    return {
      data,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  /**
   * List stock movements with pagination and filters.
   */
  async listMovements({
    page,
    pageSize,
    filters,
    organizationId,
  }: {
    page: number;
    pageSize: number;
    filters?: MovimentacoesFiltros;
    organizationId: string;
  }): Promise<any> {
    const skip = (page - 1) * pageSize;

    const where: Prisma.stock_movementsWhereInput = {
      organizationId: organizationId,
    };

    if (filters?.productId) {
      where.productId = filters.productId;
    }

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.tipo_movimentacao) {
      where.movementType = filters.tipo_movimentacao;
    }

    if (filters?.data_inicio || filters?.data_fim) {
      where.movementDate = {};
      if (filters.data_inicio) {
        where.movementDate.gte = new Date(filters.data_inicio);
      }
      if (filters.data_fim) {
        const endDate = new Date(filters.data_fim);
        endDate.setHours(23, 59, 59, 999);
        where.movementDate.lte = endDate;
      }
    }

    if (filters?.produto_nome) {
      where.products = {
        name: {
          contains: filters.produto_nome,
          mode: "insensitive",
        },
      };
    }

    const [movements, count] = await Promise.all([
      prisma.stock_movements.findMany({
        where,
        include: {
          products: {
            select: {
              id: true,
              name: true,
            },
          },
          users: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true,
            },
          },
        },
        orderBy: {
          movementDate: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.stock_movements.count({ where }),
    ]);

    return {
      data: movements,
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  /**
   * Calculate basic stock statistics.
   */
  async getStatistics(organizationId: string): Promise<StockStatistics> {
    const stats = await prisma.stock.findMany({
      where: { organizationId: organizationId },
      select: { currentQuantity: true },
    });

    const total = stats.length;
    const productsInStock = stats.filter(
      (item: any) => Number(item.currentQuantity ?? 0) > 0,
    ).length;
    const productsOutOfStock = stats.filter(
      (item: any) => Number(item.currentQuantity ?? 0) === 0,
    ).length;
    const productsLowStock = stats.filter((item: any) => {
      const qty = Number(item.currentQuantity ?? 0);
      return qty > 0 && qty < 10;
    }).length;

    return {
      totalProducts: total,
      productsInStock: productsInStock,
      productsOutOfStock: productsOutOfStock,
      productsLowStock: productsLowStock,
      lastUpdate: new Date().toISOString(),
    };
  }

  /**
   * Register a manual stock movement.
   */
  async registerMovement(params: {
    productId: number;
    movementType: "ENTRADA" | "SAIDA";
    quantity: number;
    userId: string;
    organizationId: string;
    observation?: string;
    unitOfMeasureCode?: string;
  }): Promise<any> {
    const {
      productId,
      movementType,
      quantity,
      userId,
      organizationId,
      observation,
      unitOfMeasureCode,
    } = params;

    // Verificar se o produto existe
    const product = await prisma.products.findUnique({
      where: { id: productId },
      select: { id: true, name: true },
    });

    if (!product) {
      throw new Error(STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND);
    }

    return await prisma.$transaction(async (tx: any) => {
      // Registrar movimentação
      const movement = await tx.stock_movements.create({
        data: {
          productId,
          userId,
          organizationId: organizationId,
          movementType,
          quantity,
          unitOfMeasureCode: unitOfMeasureCode || "un",
          observation:
            observation ||
            `${movementType.toLowerCase()} manual - ${product.name}`,
        },
        include: {
          products: true,
        },
      });

      // Atualizar estoque
      if (movementType === "ENTRADA") {
        await tx.stock.upsert({
          where: { productId },
          create: {
            productId,
            userId,
            organizationId: organizationId,
            currentQuantity: quantity,
            unitOfMeasureCode: unitOfMeasureCode || "un",
          },
          update: {
            currentQuantity: { increment: quantity },
          },
        });
      } else {
        const stockRow = await tx.stock.findUnique({
          where: { productId },
        });

        if (!stockRow || Number(stockRow.currentQuantity) < quantity) {
          throw new Error(STOCK_MESSAGES.ERROR_INSUFFICIENT_QUANTITY);
        }

        await tx.stock.update({
          where: { productId },
          data: {
            currentQuantity: { decrement: quantity },
          },
        });
      }

      return movement;
    });
  }

  /**
   * Register a quick entry in stock.
   */
  async registerQuickEntry(params: {
    productId: number;
    quantity: number;
    userId: string;
    organizationId: string;
    unitOfMeasureCode?: UnitOfMeasureCode;
    storageLocationId?: string;
    observation?: string;
  }): Promise<any> {
    const movement = await this.registerMovement({
      productId: params.productId,
      movementType: "ENTRADA",
      quantity: params.quantity,
      userId: params.userId,
      organizationId: params.organizationId,
      observation: params.observation,
      unitOfMeasureCode: params.unitOfMeasureCode,
    });

    const updatedStock = await prisma.stock.findUnique({
      where: { productId: params.productId },
      include: {
        products: true,
        storage_locations: true,
      },
    });

    return {
      message: STOCK_MESSAGES.ENTRY_SUCCESS,
      movement,
      updatedStock,
    };
  }

  /**
   * Register a quick exit from stock.
   */
  async registerQuickExit(params: {
    productId: number;
    quantity: number;
    userId: string;
    organizationId: string;
    unitOfMeasureCode?: UnitOfMeasureCode;
    observation?: string;
  }): Promise<any> {
    const movement = await this.registerMovement({
      productId: params.productId,
      movementType: "SAIDA",
      quantity: params.quantity,
      userId: params.userId,
      organizationId: params.organizationId,
      observation: params.observation,
      unitOfMeasureCode: params.unitOfMeasureCode,
    });

    const updatedStock = await prisma.stock.findUnique({
      where: { productId: params.productId },
      include: {
        products: true,
      },
    });

    return {
      message: STOCK_MESSAGES.EXIT_SUCCESS,
      movement,
      updatedStock,
    };
  }
}
