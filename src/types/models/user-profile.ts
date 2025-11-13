/**
 * User Profile Model - Frontend representation with Date objects
 */
export interface UserProfile {
  id: string;
  userOrganizationId: string;
  profileId: string;
  active: boolean;
  startDate: Date;
  createdAt: Date;
}

/**
 * User Profile with relationships
 */
export interface UserProfileWithRelations extends UserProfile {
  userOrganization?: {
    id: string;
    userId: string;
    organizationId: string;
  };
  profile?: {
    id: string;
    name: string;
    description: string | null;
    active: boolean;
  };
}
