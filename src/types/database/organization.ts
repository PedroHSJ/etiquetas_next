/**
 * Database entity types - Direct mapping to Supabase tables
 * These types use snake_case to match database column names exactly
 */

/**
 * organizations table
 */
export interface OrganizationEntity {
  id: string;
  name: string;
  type: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
  cnpj: string | null;
  capacity: number | null;
  opening_date: string | null;
  full_address: string | null;
  zip_code: string | null;
  district: string | null;
  latitude: number | null;
  longitude: number | null;
  main_phone: string | null;
  alt_phone: string | null;
  institutional_email: string | null;
  state_id: number | null;
  city_id: number | null;
  address: string | null;
  number: string | null;
  address_complement: string | null;
}

/**
 * departments table
 */
export interface DepartmentEntity {
  id: string;
  name: string;
  organization_id: string;
  department_type: string | null;
  created_at: string;
}

/**
 * technical_responsibles table
 */
export interface TechnicalResponsibleEntity {
  id: string;
  organization_id: string;
  responsible_type: string;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}
