import { StorageLocationEntity } from "@/types/database/storage-location";
import { StorageLocationResponseDto } from "@/types/dto/storage-location";
import { StorageLocation } from "@/types/models/storage-location";

export function toStorageLocationModel(
  entity: StorageLocationEntity | StorageLocationResponseDto
): StorageLocation {
  return {
    id: entity.id,
    name: entity.name,
    parentId: entity.parent_id,
    organizationId: entity.organization_id,
    description: entity.description,
    active: entity.active,
    createdAt: new Date(entity.created_at),
    updatedAt: new Date(entity.updated_at),
    children: (entity as StorageLocationResponseDto).children?.map(toStorageLocationModel),
  };
}

export function toStorageLocationResponseDto(
  entity: StorageLocationEntity
): StorageLocationResponseDto {
  return {
    ...entity,
  };
}
