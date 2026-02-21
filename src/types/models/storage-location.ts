/**
 * Storage Location Model - Frontend representation
 */
export interface StorageLocation {
  id: string;
  name: string;
  parentId: string | null;
  organizationId: string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;

  // Tree structure
  children?: StorageLocation[];
}
