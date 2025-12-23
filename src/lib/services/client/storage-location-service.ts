import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import {
  StorageLocationResponseDto,
  CreateStorageLocationDto,
  UpdateStorageLocationDto,
  ListStorageLocationsDto,
} from "@/types/dto/storage-location";
import { StorageLocation } from "@/types/models/storage-location";
import { toStorageLocationModel } from "@/lib/converters/storage-location";

export const StorageLocationService = {
  async getStorageLocations(
    params: ListStorageLocationsDto = {}
  ): Promise<StorageLocation[]> {
    const { data, status } = await api.get<
      ApiResponse<StorageLocationResponseDto[]>
    >("/storage-locations", {
      params: {
        organizationId: params.organizationId || undefined,
        search: params.search || undefined,
        parentId: params.parentId !== undefined ? String(params.parentId) : undefined,
      },
    });

    if (!data || !Array.isArray(data.data) || status !== 200) {
      return [];
    }

    return data.data.map(toStorageLocationModel);
  },

  async getStorageLocationById(
    id: string
  ): Promise<StorageLocation | null> {
    const { data, status } = await api.get<
      ApiResponse<StorageLocationResponseDto>
    >(`/storage-locations/${id}`);

    if (!data || !data.data || status !== 200) {
      return null;
    }

    return toStorageLocationModel(data.data);
  },

  async createStorageLocation(
    dto: CreateStorageLocationDto
  ): Promise<StorageLocation> {
    const { data, status } = await api.post<
      ApiResponse<StorageLocationResponseDto>
    >("/storage-locations", dto);

    if (!data || !data.data || (status !== 200 && status !== 201)) {
      throw new Error("Erro ao criar localização");
    }

    return toStorageLocationModel(data.data);
  },

  async updateStorageLocation(
    id: string,
    dto: UpdateStorageLocationDto
  ): Promise<StorageLocation> {
    const { data, status } = await api.put<
      ApiResponse<StorageLocationResponseDto>
    >(`/storage-locations/${id}`, dto);

    if (!data || !data.data || status !== 200) {
      throw new Error("Erro ao atualizar localização");
    }

    return toStorageLocationModel(data.data);
  },

  async deleteStorageLocation(id: string): Promise<boolean> {
    const { status } = await api.delete(`/storage-locations/${id}`);
    return status === 200;
  },
};
