/**
 * Common API response types
 */

/**
 * Generic API response
 */
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

/**
 * API error response
 */
export interface ApiErrorResponse {
  error: string;
  message?: string;
  statusCode?: number;
  details?: Record<string, unknown>;
}

/**
 * API success response
 */
export interface ApiSuccessResponse<T = unknown> {
  data: T;
  message?: string;
}

/**
 * Batch operation response
 */
export interface BatchOperationResponse<T = unknown> {
  data?: T[];
  errors?: Array<{
    index: number;
    error: string;
  }>;
  successCount: number;
  errorCount: number;
}

/**
 * File upload response
 */
export interface FileUploadResponse {
  data?: {
    url: string;
    filename: string;
    size: number;
    mimeType: string;
  };
  error?: string;
}
