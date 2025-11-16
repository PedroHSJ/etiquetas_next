/**
 * Profile API Response DTOs
 */

import { OrganizationResponseDto } from "../organization/response";

/**
 * Functionality response
 */
export interface FunctionalityResponseDto {
  id: string;
  name: string;
  description: string | null;
  route: string | null;
  active: boolean;
  createdAt: string;
}

/**
 * Permission response
 */
export interface PermissionResponseDto {
  id: string;
  functionalityId: string;
  profileId: string;
  action: string | null;
  active: boolean;
  createdAt: string;
  functionality?: FunctionalityResponseDto;
}

/**
 * Profile response
 */
export interface ProfileResponseDto {
  id: string;
  name: string;
  description: string | null;
  active: boolean;
  createdAt: string;
  slug?: string;
}

/**
 * User profile response
 */
export interface UserProfileResponseDto {
  id: string;
  userOrganizationId: string;
  profileId: string;
  active: boolean;
  startDate: string;
  createdAt: string;
  profile?: ProfileResponseDto;
  userOrganization?: {
    organization: OrganizationResponseDto;
  };
}

/**
 * Profile with permissions response
 */
export interface ProfileWithPermissionsResponseDto extends ProfileResponseDto {
  permissions: PermissionResponseDto[];
}

/**
 * Permission check response
 */
export interface PermissionCheckResponseDto {
  hasPermission: boolean;
  profileName?: string;
  functionality?: string;
}

/**
 * User profiles list response
 */
export interface UserProfilesListResponseDto {
  success: boolean;
  data: UserProfileResponseDto[];
  error?: string;
}

/**
 * UserOrganization Response DTO
 */
export interface UserOrganizationResponseDto {
  id: string;
  userId: string;
  organizationId: string;
  profileId: string;
  active: boolean;
  entryDate: string; // ISO string
  exitDate: string | null; // ISO string
  createdAt: string; // ISO string
}

/**
 * UserOrganization Response DTO with expanded relations
 */
export interface UserOrganizationExpandedResponseDto
  extends UserOrganizationResponseDto {
  profile?: ProfileResponseDto;
}

/**
 * UserPermissions Response DTO
 * Aggregated permissions for a user in an organization
 */
export interface UserPermissionsResponseDto {
  userId: string;
  organizationId: string;
  permissions: PermissionResponseDto[];
  profiles: ProfileResponseDto[];
}
