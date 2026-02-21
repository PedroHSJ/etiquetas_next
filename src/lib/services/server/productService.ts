import { prisma } from "@/lib/prisma";
import { products, groups } from "@prisma/client";

/**
 * Backend service for product operations.
 * Removed converters as per the new architectural guideline.
 * Prisma entities are returned directly since fields are mapped to camelCase in schema.
 */
export class ProductBackendService {
  constructor() {}

  async getProducts(params?: {
    organizationId?: string;
    groupId?: number;
  }): Promise<any[]> {
    const where: any = {};
    if (params?.organizationId) {
      where.organizationId = params.organizationId;
    }
    if (params?.groupId) {
      where.groupId = params.groupId;
    }

    if (params?.organizationId) {
      where.isActive = true;
    }

    return prisma.products.findMany({
      where,
      include: {
        groups: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async getProduct(id: number): Promise<any | null> {
    return prisma.products.findUnique({
      where: { id },
      include: {
        groups: true,
      },
    });
  }

  async createProduct(data: {
    name: string;
    groupId?: number | null;
    organizationId: string;
  }): Promise<any> {
    return prisma.products.create({
      data: {
        name: data.name,
        groupId: data.groupId ?? null,
        organizationId: data.organizationId,
        isActive: true,
      },
      include: {
        groups: true,
      },
    });
  }

  async updateProduct(
    id: number,
    data: {
      name?: string;
      groupId?: number | null;
      isActive?: boolean;
    },
  ): Promise<any> {
    const updateData: any = { ...data };
    updateData.updatedAt = new Date();

    return prisma.products.update({
      where: { id },
      data: updateData,
      include: {
        groups: true,
      },
    });
  }

  async deleteProduct(id: number): Promise<void> {
    await prisma.products.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
  }

  async searchProducts(organizationId: string, query: string): Promise<any[]> {
    return prisma.products.findMany({
      where: {
        organizationId: organizationId,
        isActive: true,
        name: {
          contains: query,
          mode: "insensitive",
        },
      },
      include: {
        groups: true,
      },
      orderBy: {
        name: "asc",
      },
      take: 20,
    });
  }

  // Product Groups
  async getGroups(organizationId: string): Promise<any[]> {
    return prisma.groups.findMany({
      where: {
        organizationId: organizationId,
        isActive: true,
      },
      orderBy: {
        name: "asc",
      },
    });
  }

  async createGroup(data: {
    name: string;
    description?: string | null;
    organizationId: string;
  }): Promise<any> {
    return prisma.groups.create({
      data: {
        name: data.name,
        description: data.description ?? null,
        organizationId: data.organizationId,
        isActive: true,
      },
    });
  }

  async updateGroup(
    id: number,
    data: {
      name?: string;
      description?: string | null;
      isActive?: boolean;
    },
  ): Promise<any> {
    const updateData: any = { ...data };
    updateData.updatedAt = new Date();

    return prisma.groups.update({
      where: { id },
      data: updateData,
    });
  }

  async deleteGroup(id: number): Promise<void> {
    await prisma.groups.update({
      where: { id },
      data: { isActive: false, updatedAt: new Date() },
    });
  }

  // Statistics
  async getProductStats(organizationId: string): Promise<any> {
    const [products, groups] = await Promise.all([
      prisma.products.findMany({
        where: {
          organizationId: organizationId,
          isActive: true,
        },
        select: { id: true, groupId: true },
      }),
      prisma.groups.findMany({
        where: {
          organizationId: organizationId,
          isActive: true,
        },
        select: { id: true, name: true },
      }),
    ]);

    const totalProducts = products.length;
    const totalGroups = groups.length;

    const productsByGroup = groups.map((group) => ({
      group: group.name,
      count: products.filter((p) => p.groupId === group.id).length,
    }));

    return {
      totalProducts,
      totalGroups,
      productsByGroup,
    };
  }
}
