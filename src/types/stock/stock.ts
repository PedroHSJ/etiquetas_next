// =============================================================================
// STOCK AND MOVEMENTS TYPES
// =============================================================================

import { Product } from "./product";

// Movement type
export type MovementType = "ENTRADA" | "SAIDA";

export type UnitOfMeasureCode = "un" | "kg" | "g" | "l" | "ml" | "cx" | "pct";

// Main stock interface
export interface Stock {
  id: string;
  productId: number;
  organization_id?: string | null;
  current_quantity: number;
  unit_of_measure_code: UnitOfMeasureCode;
  userId: string;
  created_at: string;
  updated_at: string;

  // Related data (joins)
  product?: Product;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };

  // Index signature to allow dynamic property access
  [key: string]: unknown;
}

// Stock movements interface
export interface StockMovement {
  id: string;
  productId: number;
  organization_id?: string | null;
  userId: string;
  movement_type: MovementType;
  quantity: number;
  unit_of_measure_code: UnitOfMeasureCode;
  observation?: string;
  movement_date: string;
  created_at: string;

  // Related data (joins)
  product?: Product;
  user?: {
    id: string;
    email?: string;
    user_metadata?: {
      full_name?: string;
    };
  };

  // Index signature to allow dynamic property access
  [key: string]: unknown;
}

// DTO for quick entry
export interface QuickEntryRequest {
  productId: number;
  quantity: number;
  organizationId?: string;
  unit_of_measure_code?: UnitOfMeasureCode;
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
  product_name?: string;
  productId?: number;
  userId?: string;
  zero_stock?: boolean;
  low_stock?: boolean;
  minimum_quantity?: number;
}

// Filters for movements
export interface MovementFilters {
  productId?: number;
  userId?: string;
  movement_type?: MovementType;
  start_date?: string;
  end_date?: string;
  product_name?: string;
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
  total_products: number;
  products_in_stock: number;
  products_out_of_stock: number;
  products_low_stock: number;
  estimated_total_value?: number;
  last_update: string;
}

// Interface for stock dashboard data
export interface StockDashboard {
  statistics: StockStatistics;
  products_out_of_stock: Stock[];
  products_low_stock: Stock[];
  recent_movements: StockMovement[];
}

// Interface for product selection in quick entry
export interface ProductSelect {
  id: number;
  name: string;
  group_id?: number;
  group: {
    id: number;
    name: string;
  };
  unit_of_measure_code: UnitOfMeasureCode;
  current_stock?: number;
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
