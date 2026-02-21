/**
 * Product and inventory database entities - Updated to camelCase to match Prisma @map schema
 */

/**
 * products table
 */
export interface ProductEntity {
  id: number;
  name: string;
  groupId: number | null;
  organizationId: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

/**
 * labels table
 */
export interface LabelEntity {
  id: number;
  productId: number | null;
  quantity: number;
  printedAt: string;
  userId: string | null;
  organizationId: string | null;
  status: string;
  notes: string | null;
  createdAt: string;
}
