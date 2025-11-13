/**
 * Request DTOs for Group operations (Product Groups)
 */

export interface CreateGroupDto {
  id: number;
  name: string;
  description?: string | null;
}

export interface UpdateGroupDto {
  name?: string;
  description?: string | null;
}
