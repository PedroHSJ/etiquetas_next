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
    route: string | null;
    active: boolean;
  };
  profile?: {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
  };
}
