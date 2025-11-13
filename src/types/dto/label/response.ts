/**
 * Label API Response DTOs
 */

import { ProductResponseDto } from "../product/response";

/**
 * Label response
 */
export interface LabelResponseDto {
  id: number;
  productId: number | null;
  quantity: number;
  printedAt: string;
  userId: string | null;
  organizationId: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
  product?: ProductResponseDto;
}

/**
 * Label list response
 */
export interface LabelListResponseDto {
  success: boolean;
  data: LabelResponseDto[];
  total?: number;
  page?: number;
  pageSize?: number;
  error?: string;
}

/**
 * Label stats response
 */
export interface LabelStatsResponseDto {
  totalLabels: number;
  totalPrinted: number;
  byStatus: Array<{
    status: string;
    count: number;
  }>;
  byProduct: Array<{
    productName: string;
    count: number;
  }>;
}
