import { ProductEntity } from "@/types/database/product";
import { GroupEntity } from "@/types/database/group";
import {
  ProductResponseDto,
  ProductGroupResponseDto,
} from "@/types/dto/product/response";
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
} from "@/types/dto/product/request";

/**
 * Converts ProductEntity to ProductResponseDto
 */
export function toProductResponseDto(
  entity: ProductEntity,
  group?: GroupEntity | null,
): ProductResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    groupId: entity.group_id,
    organizationId: entity.organization_id,
    isActive: entity.is_active,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
    group: group ? toProductGroupResponseDto(group) : undefined,
  };
}

/**
 * Converts GroupEntity to ProductGroupResponseDto
 */
export function toProductGroupResponseDto(
  entity: GroupEntity,
): ProductGroupResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    organizationId: entity.organization_id,
    isActive: entity.is_active,
  };
}

/**
 * Converts a list of ProductEntity to ProductResponseDto[]
 */
export function toProductResponseDtoList(
  entities: ProductEntity[],
  groupsMap?: Map<number, GroupEntity>,
): ProductResponseDto[] {
  return entities.map((entity) => {
    const group =
      groupsMap && entity.group_id ? groupsMap.get(entity.group_id) : undefined;
    return toProductResponseDto(entity, group);
  });
}

// REQUEST CONVERTERS

export function toProductEntityForCreate(dto: CreateProductDto): Omit<
  ProductEntity,
  "id" | "created_at" | "updated_at" | "is_active"
> & {
  is_active?: boolean;
} {
  return {
    name: dto.name,
    group_id: dto.groupId ?? null,
    organization_id: dto.organizationId,
    is_active: true,
  };
}

export function toProductEntityForUpdate(
  dto: UpdateProductDto,
): Partial<ProductEntity> {
  const entity: Partial<ProductEntity> = {};
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.groupId !== undefined) entity.group_id = dto.groupId;
  if (dto.isActive !== undefined) entity.is_active = dto.isActive;
  return entity;
}

export function toGroupEntityForCreate(dto: CreateProductGroupDto): Omit<
  GroupEntity,
  "id" | "created_at" | "updated_at" | "is_active"
> & {
  is_active?: boolean;
} {
  return {
    name: dto.name,
    description: dto.description ?? null,
    organization_id: dto.organizationId,
    is_active: true,
  };
}

export function toGroupEntityForUpdate(
  dto: UpdateProductGroupDto,
): Partial<GroupEntity> {
  const entity: Partial<GroupEntity> = {};
  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.description !== undefined) entity.description = dto.description;
  if (dto.isActive !== undefined) entity.is_active = dto.isActive;
  return entity;
}
