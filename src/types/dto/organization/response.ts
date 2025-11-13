/**
 * Organization API Response DTOs
 */

/**
 * Basic organization response
 */
export interface OrganizationResponseDto {
  id: string;
  name: string;
  type: string | null;
  userId: string | null;
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
 * Expanded organization response with relations
 */
export interface OrganizationExpandedResponseDto
  extends OrganizationResponseDto {
  state?: {
    id: number;
    code: string;
    name: string;
    region: string;
  };
  city?: {
    id: number;
    name: string;
    ibgeCode: string | null;
    state?: {
      id: number;
      code: string;
      name: string;
    };
  };
  technicalResponsible?: {
    id: string;
    responsibleType: string;
    name: string;
    document: string | null;
    phone: string | null;
    email: string | null;
  } | null;
}

/**
 * List of organizations response
 */
export interface OrganizationListResponseDto {
  data: OrganizationResponseDto[];
  error?: string;
}

/**
 * Single organization response
 */
export interface OrganizationSingleResponseDto {
  data?: OrganizationResponseDto;
  error?: string;
  message?: string;
}
