/**
 * Technical Responsible Model - Frontend representation with Date objects
 */
export interface TechnicalResponsible {
  id: string;
  organizationId: string;
  responsibleType: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Technical Responsible with organization relationship
 */
export interface TechnicalResponsibleWithOrganization
  extends TechnicalResponsible {
  organization?: {
    id: string;
    name: string;
    type: string | null;
  };
}
