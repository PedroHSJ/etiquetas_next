/**
 * Permission Model - Frontend representation with Date objects
 */
export interface Permission {
  id: string;
  functionalityId: string;
  profileId: string;
  action: string | null;
  active: boolean;
  createdAt: Date;
}

/**
 * Permission with functionality and profile relationships
 */
export interface PermissionWithRelations extends Permission {
  functionality?: {
    id: string;
    name: string;
    description: string | null;
    code: string;
    active: boolean;
  };
  profile?: {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
  };
}

/**
 * Helper type for checking permissions by code
 */
export interface PermissionCheck {
  code: string;
  action?: string;
}
