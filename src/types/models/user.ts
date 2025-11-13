/**
 * Frontend User and Profile Models
 */

import { ProfileName, UserOrganizationStatus } from "../enums/user";

/**
 * User model for frontend
 */
export interface User {
  id: string;
  email: string;
  name?: string;
  createdAt: Date;
  updatedAt?: Date;
}

/**
 * Functionality model for frontend
 */
export interface Functionality {
  id: string;
  name: string;
  description: string | null;
  route: string | null;
  active: boolean;
  createdAt: Date;
}

/**
 * Permission model for frontend
 */
export interface Permission {
  id: string;
  functionalityId: string;
  profileId: string;
  action: string | null;
  active: boolean;
  createdAt: Date;
  functionality?: Functionality;
}

/**
 * Profile model for frontend
 */
export interface Profile {
  id: string;
  name: ProfileName | string;
  description: string | null;
  active: boolean;
  createdAt: Date;
  slug?: string;
  permissions?: Permission[];
}

/**
 * User Organization model for frontend
 */
export interface UserOrganization {
  id: string;
  userId: string;
  organizationId: string;
  profileId: string;
  active: boolean;
  entryDate: Date;
  exitDate: Date | null;
  createdAt: Date;
  status?: UserOrganizationStatus;
}

/**
 * User Profile model for frontend
 */
export interface UserProfile {
  id: string;
  userOrganizationId: string;
  profileId: string;
  active: boolean;
  startDate: Date;
  createdAt: Date;
  profile?: Profile;
}

/**
 * Permission Check - Request to check if user has permission
 */
export interface PermissionCheck {
  functionality: string;
  action: string;
  userId: string;
  organizationId: string;
}

/**
 * Profile Configuration - Profile with detailed permissions
 */
export interface ProfileConfiguration {
  profileId: string;
  name: string;
  description: string;
  permissions: {
    functionalityId: string;
    functionalityName: string;
    action: string;
    active: boolean;
  }[];
}

/**
 * Functionality Configuration - Functionality with available permissions
 */
export interface FunctionalityConfiguration {
  functionalityId: string;
  name: string;
  description: string;
  category: string;
  route: string;
  permissions: {
    id: string;
    action: string;
    description: string;
    active: boolean;
  }[];
}
