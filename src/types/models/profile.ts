/**
 * Frontend Models for Profile, Permissions and User Profiles
 * These models use camelCase, Date objects, and include computed fields
 */

/**
 * Profile Model
 * Represents access profiles/roles in the system
 */
export interface Profile {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
}

/**
 * Functionality Model
 * Represents system functionalities that can have permissions
 */
export interface Functionality {
  id: string;
  name: string;
  description: string | null;
  route: string | null;
  active: boolean;
  createdAt: string;
}

/**
 * Permission Model
 * Represents access permissions for profiles to functionalities
 */
export interface Permission {
  id: string;
  functionalityId: string;
  profileId: string;
  action: string | null;
  active: boolean;
  createdAt: string;

  // Expanded fields (optional - loaded with relations)
  functionality?: Functionality;
  profile?: Profile;
}

/**
 * UserOrganization Model
 * Represents user membership in organizations with a profile
 */
export interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  profileId: string;
  active: boolean;
  entryDate: string;
  exitDate: string | null;
  createdAt: string;

  // Expanded fields (optional)
  profile?: Profile;
}

/**
 * UserProfile Model
 * Links user organizations to specific profiles
 */
export interface UserProfile {
  id: string;
  userOrganizationId: string;
  profileId: string;
  active: boolean;
  startDate: string;
  createdAt: string;

  // Expanded fields (optional)
  profile?: Profile;
  userOrganization?: UserOrganization;
}

/**
 * UserPermissions Model
 * Aggregated permissions for a user in an organization
 */
export interface UserPermissions {
  userId: string;
  organizationId: string;
  permissions: Permission[];
  profiles: Profile[];
}

/**
 * Permission Check Request
 * Used to verify if a user has a specific permission
 */
export interface PermissionCheck {
  functionality: string;
  action: string;
  userId: string;
  organizationId: string;
}
