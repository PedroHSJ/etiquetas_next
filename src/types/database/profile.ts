/**
 * Profile and permission database entities - Updated to camelCase to match Prisma @map schema
 */

/**
 * profiles table
 */
export interface ProfileEntity {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
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
  createdAt: string;
}

/**
 * permissions table
 */
export interface PermissionEntity {
  id: string;
  functionalityId: string;
  profileId: string;
  action: string | null;
  active: boolean;
  createdAt: string;
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
  userId: string;
  organizationId: string;
  profileId: string;
  active: boolean;
  entryDate: string;
  exitDate: string | null;
  createdAt: string;
}

/**
 * user_profiles table
 */
export interface UserProfileEntity {
  id: string;
  userOrganizationId: string;
  profileId: string;
  active: boolean;
  startDate: string;
  createdAt: string;
}
