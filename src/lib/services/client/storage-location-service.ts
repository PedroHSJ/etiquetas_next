import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import {
  StorageLocationResponseDto,
  CreateStorageLocationDto,
  UpdateStorageLocationDto,
  ListStorageLocationsDto,
} from "@/types/dto/storage-location";

export const StorageLocationService = {
  async getStorageLocations(
    params: ListStorageLocationsDto = {},
  ): Promise<StorageLocationResponseDto[]> {
    const { data, status } = await api.get<
      ApiResponse<StorageLocationResponseDto[]>
    >("/storage-locations", {
      params: {
        organizationId: params.organizationId || undefined,
        search: params.search || undefined,
        parentId:
          params.parentId !== undefined ? String(params.parentId) : undefined,
      },
    });

    if (!data || !Array.isArray(data.data) || status !== 200) {
      return [];
    }

    return data.data;
  },

  async getStorageLocationById(
    id: string,
  ): Promise<StorageLocationResponseDto | null> {
    const { data, status } = await api.get<
      ApiResponse<StorageLocationResponseDto>
    >(`/storage-locations/${id}`);

    if (!data || !data.data || status !== 200) {
      return null;
    }

    return data.data;
  },

  async createStorageLocation(
    dto: CreateStorageLocationDto,
  ): Promise<StorageLocationResponseDto> {
    const { data, status } = await api.post<
      ApiResponse<StorageLocationResponseDto>
    >("/storage-locations", dto);

    if (!data || !data.data || (status !== 200 && status !== 201)) {
      throw new Error("Erro ao criar localização");
    }

    return data.data;
  },

  async updateStorageLocation(
    id: string,
    dto: UpdateStorageLocationDto,
  ): Promise<StorageLocationResponseDto> {
    const { data, status } = await api.put<
      ApiResponse<StorageLocationResponseDto>
    >(`/storage-locations/${id}`, dto);

    if (!data || !data.data || status !== 200) {
      throw new Error("Erro ao atualizar localização");
    }

    return data.data;
  },

  async deleteStorageLocation(id: string): Promise<boolean> {
    const { status } = await api.delete(`/storage-locations/${id}`);
    return status === 200;
  },
};
