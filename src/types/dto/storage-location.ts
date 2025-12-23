import { StorageLocationEntity } from "../database/storage-location";

export interface CreateStorageLocationDto {
  name: string;
  parentId?: string | null;
  organizationId: string;
  description?: string;
  active?: boolean;
}

export interface UpdateStorageLocationDto {
  name?: string;
  parentId?: string | null;
  description?: string;
  active?: boolean;
}

export interface StorageLocationResponseDto extends StorageLocationEntity {
  children?: StorageLocationResponseDto[];
}

export interface ListStorageLocationsDto {
  organizationId?: string;
  parentId?: string | null; // For filtering by parent (null for root)
  search?: string;
}
