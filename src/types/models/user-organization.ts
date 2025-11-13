/**
 * User Organization Model - Frontend representation with Date objects
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
}

/**
 * User Organization with relationships
 */
export interface UserOrganizationWithRelations extends UserOrganization {
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
  profile?: {
    id: string;
    name: string;
    description: string | null;
  };
}
