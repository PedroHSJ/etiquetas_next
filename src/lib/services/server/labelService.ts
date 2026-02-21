import { prisma } from "@/lib/prisma";

export class LabelBackendService {
  async createLabel(data: {
    productId: number;
    userId: string;
    organizationId: string;
    quantity: number;
    notes?: string;
    status?: string;
    printDate?: Date;
    stockInTransitId?: string;
  }) {
    return prisma.labels.create({
      data: {
        productId: data.productId,
        userId: data.userId,
        organizationId: data.organizationId,
        quantity: data.quantity,
        status: data.status || "printed",
        notes: data.notes,
        printedAt: new Date(),
        stockInTransitId: data.stockInTransitId,
      },
    });
  }

  async listLabels(params: {
    userId?: string;
    organizationId?: string;
    page: number;
    pageSize: number;
    searchTerm?: string;
  }) {
    const { userId, organizationId, page, pageSize } = params;
    const searchTerm = params.searchTerm || "";
    const skip = (page - 1) * pageSize;

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (searchTerm) {
      where.OR = [
        {
          products: {
            name: {
              contains: searchTerm,
              mode: "insensitive",
            },
          },
        },
        {
          notes: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
        {
          status: {
            contains: searchTerm,
            mode: "insensitive",
          },
        },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.labels.findMany({
        where,
        include: {
          products: {
            select: {
              name: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        skip,
        take: pageSize,
      }),
      prisma.labels.count({ where }),
    ]);

    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
}
