// =============================================================================
// STOCK AND MOVEMENTS TYPES
// =============================================================================

import { Product } from "./product";

// Movement type
export type MovementType = "ENTRADA" | "SAIDA";

// Main stock interface
export interface Stock {
  id: string;
  product_id: number;
  current_quantity: number;
  user_id: string;
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
  product_id: number;
  user_id: string;
  movement_type: MovementType;
  quantity: number;
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
  product_id: number;
  quantity: number;
  observation?: string;
}

// DTO for quick entry response
export interface QuickEntryResponse {
  success: boolean;
  message: string;
  movement?: StockMovement;
  updated_stock?: Stock;
}

// Filters for stock listing
export interface StockFilters {
  product_name?: string;
  product_id?: number;
  user_id?: string;
  zero_stock?: boolean;
  low_stock?: boolean;
  minimum_quantity?: number;
}

// Filters for movements
export interface MovementFilters {
  product_id?: number;
  user_id?: string;
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
  unit_of_measure?: string;
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
  ENTRY_SUCCESS: "✅ Entry registered successfully!",
  EXIT_SUCCESS: "✅ Exit registered successfully!",
  ERROR_INSUFFICIENT_QUANTITY: "Insufficient quantity in stock",
  ERROR_PRODUCT_NOT_FOUND: "Product not found",
  ERROR_INVALID_QUANTITY: "Quantity must be greater than zero",
  ERROR_USER_NOT_AUTHORIZED: "User not authorized",
} as const;

// Default pagination settings
export const STOCK_PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  MAX_PAGE_SIZE: 100,
} as const;
