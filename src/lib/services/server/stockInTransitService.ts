import { prisma } from "@/lib/prisma";
import {
  StockInTransitResponseDto,
  StockInTransitListResponseDto,
} from "@/types/dto/stock-in-transit/response";
import {
  CreateStockInTransitDto,
  UpdateStockInTransitDto,
} from "@/types/dto/stock-in-transit/request";

export class StockInTransitBackendService {
  constructor() {}

  private mapToDto(item: any): StockInTransitResponseDto {
    return {
      ...item,
      product: item.products
        ? {
            ...item.products,
            currentQuantity: item.products.currentQuantity
              ? Number(item.products.currentQuantity)
              : 0,
            createdAt: item.products.createdAt.toISOString(),
            updatedAt: item.products.updatedAt.toISOString(),
          }
        : undefined,
      manufacturingDate: item.manufacturingDate.toISOString(),
      expiryDate: item.expiryDate?.toISOString() || null,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }

  async list(params: {
    page: number;
    pageSize: number;
    organizationId: string;
  }): Promise<StockInTransitListResponseDto> {
    const { page, pageSize, organizationId } = params;
    const skip = (page - 1) * pageSize;

    const [data, count] = await Promise.all([
      prisma.stock_in_transit.findMany({
        where: {
          organizationId: organizationId,
        },
        include: {
          products: true,
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.stock_in_transit.count({
        where: {
          organizationId: organizationId,
        },
      }),
    ]);

    return {
      success: true,
      data: data.map((item) => this.mapToDto(item)),
      total: count,
      page,
      pageSize,
      totalPages: Math.ceil(count / pageSize),
    };
  }

  async getById(id: string): Promise<StockInTransitResponseDto> {
    const data = await prisma.stock_in_transit.findUnique({
      where: { id },
      include: {
        products: true,
      },
    });

    if (!data) throw new Error("Item not found");
    return this.mapToDto(data);
  }

  async create(
    dto: CreateStockInTransitDto,
    userId: string,
    organizationId: string,
  ): Promise<StockInTransitResponseDto> {
    const data = await prisma.stock_in_transit.create({
      data: {
        productId: dto.productId,
        quantity: dto.quantity,
        unitOfMeasureCode: dto.unitOfMeasureCode,
        manufacturingDate: dto.manufacturingDate
          ? new Date(dto.manufacturingDate)
          : new Date(),
        expiryDate: dto.expiryDate ? new Date(dto.expiryDate) : null,
        organizationId: organizationId,
        userId: userId,
        observations: dto.observations,
      },
      include: {
        products: true,
      },
    });

    return this.mapToDto(data);
  }

  async update(
    id: string,
    dto: UpdateStockInTransitDto,
  ): Promise<StockInTransitResponseDto> {
    const updateData: any = {};
    if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
    if (dto.manufacturingDate !== undefined)
      updateData.manufacturingDate = dto.manufacturingDate
        ? new Date(dto.manufacturingDate)
        : null;
    if (dto.expiryDate !== undefined)
      updateData.expiryDate = dto.expiryDate ? new Date(dto.expiryDate) : null;
    if (dto.observations !== undefined)
      updateData.observations = dto.observations;

    const data = await prisma.stock_in_transit.update({
      where: { id },
      data: updateData,
      include: {
        products: true,
      },
    });

    return this.mapToDto(data);
  }

  async delete(id: string): Promise<void> {
    await prisma.stock_in_transit.delete({
      where: { id },
    });
  }
}
