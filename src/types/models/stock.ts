import { UnitOfMeasureCode, MovementType } from "@/types/stock/stock";

export interface MovementUserModel {
  id: string;
  email?: string;
  name?: string;
  fullName?: string;
}

export interface ProductStockModel {
  id: number;
  name: string;
  groupId?: number | null;
  unitOfMeasureCode?: UnitOfMeasureCode;
  currentQuantity?: number;
}

export interface StorageLocationStockModel {
  id: string;
  name: string;
  parentId?: string | null;
}

export interface StockModel {
  id: string;
  productId: number;
  organizationId?: string | null;
  currentQuantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  storageLocationId?: string | null;
  userId: string;
  createdAt: Date;
  updatedAt: Date;
  product?: ProductStockModel;
  storageLocation?: StorageLocationStockModel | null;
}

export interface StockMovementModel {
  id: string;
  productId: number;
  organizationId?: string | null;
  userId: string;
  movementType: MovementType;
  quantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  observation?: string | null;
  movementDate: Date;
  createdAt: Date;
  user?: MovementUserModel;
  product?: ProductStockModel;
}

export interface StockListModelResponse {
  data: StockModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

export interface MovementListModelResponse {
  data: StockMovementModel[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
