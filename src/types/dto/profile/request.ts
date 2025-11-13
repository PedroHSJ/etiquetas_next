/**
 * Profile API Request DTOs
 */

/**
 * DTO for creating a profile
 */
export interface CreateProfileDto {
  name: string;
  description?: string;
}

/**
 * DTO for updating a profile
 */
export interface UpdateProfileDto {
  name?: string;
  description?: string;
  active?: boolean;
}

/**
 * DTO for profile query filters
 */
export interface ProfileQueryDto {
  search?: string;
  activeOnly?: boolean;
}

/**
 * DTO for assigning a profile to a user
 */
export interface AssignProfileDto {
  userId: string;
  organizationId: string;
  profileId: string;
}

/**
 * DTO for removing a profile from a user
 */
export interface RemoveProfileDto {
  userId: string;
  organizationId: string;
  profileId: string;
}

/**
 * DTO for checking permissions
 */
export interface CheckPermissionDto {
  userId: string;
  organizationId: string;
  functionalityName: string;
  action?: string;
}
