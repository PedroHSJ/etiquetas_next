/**
 * Profile and permission database entities
 */

/**
 * profiles table
 */
export interface ProfileEntity {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  created_at: string;
}

/**
 * functionalities table
 */
export interface FunctionalityEntity {
  id: string;
  name: string;
  description: string | null;
  code: string;
  active: boolean;
  created_at: string;
}

/**
 * permissions table
 */
export interface PermissionEntity {
  id: string;
  functionality_id: string;
  profile_id: string;
  action: string | null;
  active: boolean;
  created_at: string;
  // Relations (optional, populated by joins)
  functionality?: FunctionalityEntity;
  profile?: ProfileEntity;
}

/**
 * Permission with relations populated
 */
export interface PermissionWithRelationsEntity extends PermissionEntity {
  functionality: FunctionalityEntity;
  profile: ProfileEntity;
}

/**
 * user_organizations table
 * Many-to-many relationship between users and organizations
 */
export interface UserOrganizationEntity {
  id: string;
  user_id: string;
  organization_id: string;
  profile_id: string;
  active: boolean;
  entry_date: string;
  exit_date: string | null;
  created_at: string;
}

/**
 * user_profiles table
 */
export interface UserProfileEntity {
  id: string;
  user_organization_id: string;
  profile_id: string;
  active: boolean;
  start_date: string;
  created_at: string;
}
