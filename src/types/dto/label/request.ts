/**
 * Label API Request DTOs
 */

/**
 * DTO for creating a label
 */
export interface CreateLabelDto {
  productId?: number;
  quantity?: number;
  organizationId?: string;
  notes?: string;
}

/**
 * DTO for updating a label
 */
export interface UpdateLabelDto {
  productId?: number;
  quantity?: number;
  status?: string;
  notes?: string;
}

/**
 * DTO for label query filters
 */
export interface LabelQueryDto {
  organizationId?: string;
  productId?: number;
  userId?: string;
  status?: string;
  startDate?: string;
  endDate?: string;
}

/**
 * DTO for batch label printing
 */
export interface BatchPrintLabelsDto {
  labels: Array<{
    productId: number;
    quantity: number;
  }>;
  organizationId: string;
}
