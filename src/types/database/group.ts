/**
 * Database Entity for groups table (Product Groups)
 */
export interface GroupEntity {
  id: number;
  name: string;
  description: string | null;
  organization_id: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
