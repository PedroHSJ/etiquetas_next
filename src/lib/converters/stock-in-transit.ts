import { StockInTransitEntity } from "@/types/database/stock-in-transit";
import { StockInTransitResponseDto } from "@/types/dto/stock-in-transit/response";
import {
  CreateStockInTransitDto,
  UpdateStockInTransitDto,
} from "@/types/dto/stock-in-transit/request";
import { StockInTransit } from "@/types/models/stock-in-transit";
import { toProductStockModel, toProductStockResponseDto } from "./stock";

// ============= Entity → DTO =============
export function toStockInTransitResponseDto(
  entity: StockInTransitEntity & { product?: any },
): StockInTransitResponseDto {
  return {
    id: entity.id,
    productId: entity.product_id, // Map database snake_case to DTO camelCase
    quantity: Number(entity.quantity),
    unitOfMeasureCode: entity.unit_of_measure_code,
    manufacturingDate: entity.manufacturing_date,
    expiryDate: entity.expiry_date,
    organizationId: entity.organization_id,
    userId: entity.user_id,
    observations: entity.observations,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
    product: entity.product
      ? toProductStockResponseDto(entity.product)
      : undefined,
  };
}

// ============= DTO → Model =============
export function toStockInTransitModel(
  dto: StockInTransitResponseDto,
): StockInTransit {
  const now = new Date();
  const validityDate = dto.expiryDate ? new Date(dto.expiryDate) : null;

  const daysRemaining = validityDate
    ? Math.ceil(
        (validityDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
      )
    : null;

  return {
    id: dto.id,
    productId: dto.productId,
    quantity: dto.quantity,
    unitOfMeasureCode: dto.unitOfMeasureCode,
    manufacturingDate: dto.manufacturingDate
      ? new Date(dto.manufacturingDate)
      : null,
    expiryDate: validityDate,
    organizationId: dto.organizationId,
    userId: dto.userId,
    observations: dto.observations,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),
    product: dto.product
      ? (toProductStockModel(dto.product) as any)
      : undefined,

    // Computed fields
    isExpired: validityDate ? validityDate < now : false,
    daysRemaining,
  };
}

// ============= DTO → Entity (for create) =============
export function toStockInTransitEntityForCreate(
  dto: CreateStockInTransitDto,
  userId: string,
  organizationId: string,
): Partial<StockInTransitEntity> {
  return {
    product_id: dto.productId, // Map DTO camelCase to database snake_case
    quantity: dto.quantity,
    unit_of_measure_code: dto.unitOfMeasureCode,
    manufacturing_date: dto.manufacturingDate || new Date().toISOString(),
    expiry_date: dto.expiryDate,
    organization_id: organizationId,
    user_id: userId,
    observations: dto.observations,
  };
}

// ============= DTO → Entity (for update) =============
export function toStockInTransitEntityForUpdate(
  dto: UpdateStockInTransitDto,
): Partial<StockInTransitEntity> {
  const updateData: Partial<StockInTransitEntity> = {};

  if (dto.quantity !== undefined) updateData.quantity = dto.quantity;
  if (dto.manufacturingDate !== undefined)
    updateData.manufacturing_date = dto.manufacturingDate;
  if (dto.expiryDate !== undefined) updateData.expiry_date = dto.expiryDate;
  if (dto.observations !== undefined)
    updateData.observations = dto.observations;

  return updateData;
}
