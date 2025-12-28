import {
  ProductStockResponseDto,
  StockMovementResponseDto,
  StockResponseDto,
  MovementUserDto,
} from "@/types/dto/stock/response";
import { StockEntity, StockMovementEntity } from "@/types/database/stock";
import { UnitOfMeasureCode } from "@/types/stock/stock";
import {
  ProductStockModel,
  StockModel,
  StockMovementModel,
  MovementUserModel,
} from "@/types/models/stock";

type ProductEntityLike = {
  id: number;
  name: string;
  group_id?: number | null;
  unit_of_measure_code?: UnitOfMeasureCode | null;
  current_quantity?: number | null;
  current_stock?: number | null;
  estoque_atual?: number | null;
} | null;

const parseQuantity = (value: unknown): number => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

export function toProductStockResponseDto(
  product?: ProductEntityLike
): ProductStockResponseDto | undefined {
  if (!product) return undefined;

  return {
    id: product.id,
    name: product.name,
    groupId: product.group_id ?? null,
    unitOfMeasureCode: product.unit_of_measure_code ?? undefined,
    currentQuantity:
      product.current_quantity !== undefined
        ? parseQuantity(product.current_quantity)
        : product.current_stock !== undefined
        ? parseQuantity(product.current_stock)
        : product.estoque_atual !== undefined
        ? parseQuantity(product.estoque_atual)
        : undefined,
  };
}

export function toStockResponseDto(
  entity: StockEntity & { product?: ProductEntityLike }
): StockResponseDto {
  return {
    id: entity.id,
    productId: entity.productId,
    organizationId: entity.organization_id ?? null,
    currentQuantity: parseQuantity(entity.current_quantity),
    unitOfMeasureCode: (entity.unit_of_measure_code ||
      "un") as UnitOfMeasureCode,
    userId: entity.userId,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
    product: toProductStockResponseDto(entity.product),
  };
}

export function toStockMovementResponseDto(
  entity: StockMovementEntity & {
    product?: ProductEntityLike;
    user?: MovementUserDto;
  }
): StockMovementResponseDto {
  return {
    id: entity.id,
    productId: entity.productId,
    organizationId: entity.organization_id ?? null,
    userId: entity.userId,
    movementType: entity.movement_type,
    quantity: parseQuantity(entity.quantity),
    unitOfMeasureCode: (entity.unit_of_measure_code ||
      "un") as UnitOfMeasureCode,
    observation: entity.observation,
    movementDate: entity.movement_date,
    createdAt: entity.created_at,
    user: entity.user,
    product: toProductStockResponseDto(entity.product),
  };
}

// ============================================================
// DTO -> Model converters (frontend camelCase + Date)
// ============================================================

export function toProductStockModel(
  product?: ProductStockResponseDto
): ProductStockModel | undefined {
  if (!product) return undefined;
  return {
    id: product.id,
    name: product.name,
    groupId: product.groupId ?? null,
    unitOfMeasureCode: product.unitOfMeasureCode,
    currentQuantity: product.currentQuantity,
  };
}

const toUserModel = (
  user?: StockMovementResponseDto["user"]
): MovementUserModel | undefined => {
  if (!user) return undefined;
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    fullName: user.fullName ?? user.name,
  };
};

export function toStockModel(
  dto:
    | StockResponseDto
    | (StockEntity & {
        product?: ProductEntityLike;
        storage_location?: {
          id: string;
          name: string;
          parent_id?: string | null;
        } | null;
      })
): StockModel {
  const baseDto =
    "currentQuantity" in dto
      ? dto
      : toStockResponseDto(
          dto as unknown as StockEntity & { product?: ProductEntityLike }
        );

  // Handle storage_location from raw entity
  const rawEntity = dto as StockEntity & {
    product?: ProductEntityLike;
    storage_location?: {
      id: string;
      name: string;
      parent_id?: string | null;
    } | null;
  };
  const storageLocation = rawEntity.storage_location
    ? {
        id: rawEntity.storage_location.id,
        name: rawEntity.storage_location.name,
        parentId: rawEntity.storage_location.parent_id ?? null,
      }
    : null;

  return {
    id: baseDto.id,
    productId: baseDto.productId,
    organizationId: baseDto.organizationId ?? null,
    currentQuantity: baseDto.currentQuantity,
    unitOfMeasureCode: baseDto.unitOfMeasureCode,
    storageLocationId: rawEntity.storage_location_id ?? null,
    userId: baseDto.userId,
    createdAt: new Date(baseDto.createdAt),
    updatedAt: new Date(baseDto.updatedAt),
    product: toProductStockModel(baseDto.product),
    storageLocation,
  };
}

export function toStockMovementModel(
  dto:
    | StockMovementResponseDto
    | (StockMovementEntity & { product?: ProductEntityLike })
): StockMovementModel {
  const baseDto =
    "movementType" in dto
      ? dto
      : toStockMovementResponseDto(
          dto as unknown as StockMovementEntity & {
            product?: ProductEntityLike;
          }
        );

  return {
    id: baseDto.id,
    productId: baseDto.productId,
    organizationId: baseDto.organizationId ?? null,
    userId: baseDto.userId,
    movementType: baseDto.movementType,
    quantity: baseDto.quantity,
    unitOfMeasureCode: baseDto.unitOfMeasureCode,
    observation: baseDto.observation,
    movementDate: new Date(baseDto.movementDate),
    createdAt: new Date(baseDto.createdAt),
    product: toProductStockModel(baseDto.product),
    user: toUserModel(baseDto.user),
  };
}
