/**
 * Common pagination types
 */

/**
 * Pagination request parameters
 */
export interface PaginationDto {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

/**
 * Paginated response metadata
 */
export interface PaginationMetaDto {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

/**
 * Paginated response
 */
export interface PaginatedResponseDto<T> {
  success: boolean;
  data: T[];
  meta: PaginationMetaDto;
  error?: string;
}
