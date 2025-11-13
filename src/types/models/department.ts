/**
 * Department Model - Frontend representation with Date objects
 */
export interface Department {
  id: string;
  name: string;
  organizationId: string;
  departmentType: string | null;
  createdAt: Date;
}

/**
 * Department with organization relationship
 */
export interface DepartmentWithOrganization extends Department {
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
}
