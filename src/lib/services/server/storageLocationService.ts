import { prisma } from "@/lib/prisma";
import { storage_locations } from "@prisma/client";
import {
  CreateStorageLocationDto,
  UpdateStorageLocationDto,
  ListStorageLocationsDto,
  StorageLocationResponseDto,
} from "@/types/dto/storage-location";

export class StorageLocationBackendService {
  constructor() {}

  async listStorageLocations(
    params: ListStorageLocationsDto = {},
  ): Promise<storage_locations[]> {
    const { organizationId, parentId, search } = params;

    const where: any = {};

    if (organizationId) {
      where.organizationId = organizationId;
    }

    if (parentId !== undefined) {
      where.parentId = parentId;
    }

    if (search?.trim()) {
      where.name = {
        contains: search.trim(),
        mode: "insensitive",
      };
    }

    const data = await prisma.storage_locations.findMany({
      where,
      orderBy: {
        createdAt: "asc",
      },
    });

    return data;
  }

  async getStorageLocationById(id: string): Promise<storage_locations | null> {
    const data = await prisma.storage_locations.findUnique({
      where: { id },
    });

    if (!data) return null;

    return data;
  }

  async createStorageLocation(
    dto: CreateStorageLocationDto,
  ): Promise<storage_locations> {
    const data = await prisma.storage_locations.create({
      data: {
        name: dto.name,
        organizationId: dto.organizationId,
        parentId: dto.parentId ?? null,
        description: dto.description ?? null,
        active: dto.active ?? true,
      },
    });

    return data;
  }

  async updateStorageLocation(
    id: string,
    dto: UpdateStorageLocationDto,
  ): Promise<storage_locations> {
    const updateData: any = {};

    if (dto.name !== undefined) updateData.name = dto.name;
    if (dto.parentId !== undefined) updateData.parentId = dto.parentId;
    if (dto.description !== undefined) updateData.description = dto.description;
    if (dto.active !== undefined) updateData.active = dto.active;

    updateData.updatedAt = new Date();

    const data = await prisma.storage_locations.update({
      where: { id },
      data: updateData,
    });

    return data;
  }

  async deleteStorageLocation(id: string): Promise<void> {
    await prisma.storage_locations.delete({
      where: { id },
    });
  }
}
