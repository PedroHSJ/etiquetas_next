export interface StorageLocationEntity {
  id: string;
  name: string;
  parentId: string | null;
  organizationId: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
