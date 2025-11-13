/**
 * Organization API Request DTOs
 */

/**
 * DTO for creating a new organization
 */
export interface CreateOrganizationDto {
  name: string;
  type?: string;
  cnpj?: string;
  capacity?: number;
  openingDate?: string;
  fullAddress?: string;
  zipCode?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  mainPhone?: string;
  altPhone?: string;
  institutionalEmail?: string;
  stateId?: number;
  cityId?: number;
  address?: string;
  number?: string;
  addressComplement?: string;
}

/**
 * DTO for updating an organization
 */
export interface UpdateOrganizationDto {
  name?: string;
  type?: string;
  cnpj?: string;
  capacity?: number;
  openingDate?: string;
  fullAddress?: string;
  zipCode?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  mainPhone?: string;
  altPhone?: string;
  institutionalEmail?: string;
  stateId?: number;
  cityId?: number;
  address?: string;
  number?: string;
  addressComplement?: string;
}

/**
 * DTO for organization query filters
 */
export interface OrganizationQueryDto {
  userId?: string;
  type?: string;
  stateId?: number;
  cityId?: number;
  search?: string;
}
