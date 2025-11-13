/**
 * Frontend Label Models
 */

import { LabelStatus } from "../enums/label";
import { Product } from "./product";

/**
 * Label model for frontend
 */
export interface Label {
  id: number;
  productId: number | null;
  quantity: number;
  printedAt: Date;
  userId: string | null;
  organizationId: string | null;
  status: LabelStatus;
  notes: string | null;
  createdAt: Date;
  product?: Product;

  // Computed fields
  isExpired?: boolean;
  daysUntilExpiry?: number;
  formattedPrintedDate?: string;
}

/**
 * Label with expiry tracking
 */
export interface ExpiryLabel extends Label {
  expiryDate: Date;
  expiryStatus: "ok" | "warning" | "expired";
  hoursUntilExpiry: number;
}

/**
 * Label stats model
 */
export interface LabelStats {
  totalLabels: number;
  totalPrinted: number;
  byStatus: Array<{
    status: LabelStatus;
    count: number;
    percentage?: number;
  }>;
  byProduct: Array<{
    productName: string;
    count: number;
    percentage?: number;
  }>;
  expiringToday?: number;
  expiringTomorrow?: number;
  expired?: number;
}
