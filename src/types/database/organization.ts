/**
 * Database entity types - Updated to camelCase to match Prisma @map schema
 */

/**
 * organizations table
 */
export interface OrganizationEntity {
  id: string;
  name: string;
  type: string | null;
  createdBy: string | null;
  createdAt: string;
  updatedAt: string;
  cnpj: string | null;
  capacity: number | null;
  openingDate: string | null;
  fullAddress: string | null;
  zipCode: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  mainPhone: string | null;
  altPhone: string | null;
  institutionalEmail: string | null;
  stateId: number | null;
  cityId: number | null;
  address: string | null;
  number: string | null;
  addressComplement: string | null;
}

/**
 * departments table
 */
export interface DepartmentEntity {
  id: string;
  name: string;
  organizationId: string;
  departmentType: string | null;
  createdAt: string;
}

/**
 * technical_responsibles table
 */
export interface TechnicalResponsibleEntity {
  id: string;
  organizationId: string;
  responsibleType: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
