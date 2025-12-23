export interface StorageLocationEntity {
  id: string;
  name: string;
  parent_id: string | null;
  organization_id: string;
  description: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
