/**
 * Frontend Organization Models
 * These models include computed fields and use Date objects
 */

import { ResponsibleType, OrganizationType } from "../enums/organization";
import { Department } from "./department";
import { City, State } from "./location";

/**
 * Technical Responsible model for frontend
 */
export interface TechnicalResponsible {
  id: string;
  organizationId: string;
  responsibleType: ResponsibleType;
  name: string;
  document: string | null;
  phone: string | null;
  email: string | null;
  notes: string | null;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  formattedPhone?: string;
  formattedDocument?: string;
}

/**
 * Organization model for frontend
 */
export interface Organization {
  id: string;
  name: string;
  type: OrganizationType | null;
  userId: string | null;
  createdAt: Date;
  updatedAt: Date;
  cnpj: string | null;
  capacity: number | null;
  openingDate: Date | null;
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

  // Relations
  state?: State;
  city?: City;
  technicalResponsible?: TechnicalResponsible | null;
  departments?: Department[];

  // Computed fields
  formattedCnpj?: string;
  formattedMainPhone?: string;
  formattedAltPhone?: string;
  formattedZipCode?: string;
  fullAddressFormatted?: string;
}

/**
 * Template de configuração para diferentes tipos de organizações
 */
export interface OrganizationTemplate {
  departamentos: Array<{
    nome: string;
    tipo: string;
  }>;
  especializacoes: Record<string, string[]>;
  terminologia: {
    organizacao: string;
    departamento: string;
    especializacao: string;
    integrante: string;
  };
}
