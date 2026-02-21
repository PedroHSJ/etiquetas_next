// =============================================================================
// STOCK AND MOVEMENTS TYPES - CAMELCASE (Matching Prisma Schema)
// =============================================================================

import { Product } from "./product";

// Movement type
export type MovementType = "ENTRADA" | "SAIDA";

export type UnitOfMeasureCode = "un" | "kg" | "g" | "l" | "ml" | "cx" | "pct";

// Main stock interface
export interface Stock {
  id: string;
  productId: number;
  organizationId?: string | null;
  currentQuantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  storageLocationId?: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;

  // Related data (joins)
  product?: Product;
  storageLocation?: {
    id: string;
    name: string;
    parentId?: string | null;
  } | null;
  user?: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };

  // Index signature to allow dynamic property access
  [key: string]: unknown;
}

// Stock movements interface
export interface StockMovement {
  id: string;
  productId: number;
  organizationId?: string | null;
  userId: string;
  movementType: MovementType;
  quantity: number;
  unitOfMeasureCode: UnitOfMeasureCode;
  storageLocationId?: string | null;
  observation?: string;
  movementDate: string;
  createdAt: string;

  // Related data (joins)
  product?: Product;
  user?: {
    id: string;
    email?: string;
    name?: string;
    image?: string;
  };

  // Index signature to allow dynamic property access
  [key: string]: unknown;
}

// DTO for quick entry
export interface QuickEntryRequest {
  productId: number;
  quantity: number;
  organizationId?: string;
  unitOfMeasureCode?: UnitOfMeasureCode;
  storageLocationId?: string;
  observation?: string;
}

// DTO for quick entry response
export interface QuickEntryResponse {
  message: string;
  movement?: StockMovement;
  updatedStock?: Stock;
  success?: boolean;
}

// Filters for stock listing
export interface StockFilters {
  productName?: string;
  productId?: number;
  userId?: string;
  zeroStock?: boolean;
  lowStock?: boolean;
  minimumQuantity?: number;
}

// Filters for movements
export interface MovementFilters {
  productId?: number;
  userId?: string;
  movementType?: MovementType;
  startDate?: string;
  endDate?: string;
  productName?: string;
}

// Interface for paginated stock listing
export interface StockListResponse {
  data: Stock[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Interface for paginated movements listing
export interface MovementListResponse {
  data: StockMovement[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Stock statistics (for dashboard)
export interface StockStatistics {
  totalProducts: number;
  productsInStock: number;
  productsOutOfStock: number;
  productsLowStock: number;
  estimatedTotalValue?: number;
  lastUpdate: string;
}

// Interface for stock dashboard data
export interface StockDashboard {
  statistics: StockStatistics;
  productsOutOfStock: Stock[];
  productsLowStock: Stock[];
  recentMovements: StockMovement[];
}

// Interface for product selection in quick entry
export interface ProductSelect {
  id: number;
  name: string;
  groupId?: number;
  group: {
    id: number;
    name: string;
  };
  unitOfMeasureCode: UnitOfMeasureCode;
  currentQuantity?: number;
}

// Constants for movement types
export const MOVEMENT_TYPES = [
  { value: "ENTRADA", label: "Entrada" },
  { value: "SAIDA", label: "Saída" },
] as const;

// Quantity validation
export const QUANTITY_VALIDATION = {
  min: 0.001,
  max: 999999.999,
  step: 0.001,
} as const;

// Default messages
export const STOCK_MESSAGES = {
  ENTRY_SUCCESS: "Entrada registrada com sucesso!",
  EXIT_SUCCESS: "Saída registrada com sucesso!",
  ERROR_INSUFFICIENT_QUANTITY: "Quantidade insuficiente em estoque.",
  ERROR_PRODUCT_NOT_FOUND: "Produto não encontrado.",
  ERROR_INVALID_QUANTITY: "Quantidade deve ser maior que zero.",
  ERROR_USER_NOT_AUTHORIZED: "Usuário não autorizado.",
} as const;

// Default pagination settings
export const STOCK_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
