/**
 * Organization Converters
 *
 * Funções de conversão entre as diferentes camadas:
 * - Database Entity (snake_case) ↔ Response DTO (camelCase)
 * - Response DTO (camelCase) ↔ Frontend Model (Date objects, computed fields)
 * - Request DTO (camelCase) → Database Entity (snake_case)
 *
 * TODAS as regras de negócio existentes foram preservadas!
 */

import {
  OrganizationEntity,
  DepartmentEntity,
} from "@/types/database/organization";
import { StateEntity, CityEntity } from "@/types/database/location";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@/types/dto/organization/request";
import {
  OrganizationResponseDto,
  OrganizationExpandedResponseDto,
} from "@/types/dto/organization/response";
import { Organization } from "@/types/models/organization";
import { OrganizationType } from "@/types/enums/organization";
import { Department } from "@/types/models/department";

// ============================================================================
// REGRAS DE NEGÓCIO - Validação e Formatação
// ============================================================================

/**
 * Valida CNPJ (mantém lógica existente)
 */
export function validateCNPJ(cnpj: string): boolean {
  const cleanCnpj = cnpj.replace(/\D/g, "");

  if (cleanCnpj.length !== 14) return false;

  // Verificar se não são todos os mesmos dígitos
  if (/^(\d)\1+$/.test(cleanCnpj)) return false;

  // Validar dígitos verificadores
  let soma = 0;
  let pos = 5;

  for (let i = 0; i < 12; i++) {
    soma += parseInt(cleanCnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  let resto = soma % 11;
  const digito1 = resto < 2 ? 0 : 11 - resto;

  if (parseInt(cleanCnpj.charAt(12)) !== digito1) return false;

  soma = 0;
  pos = 6;

  for (let i = 0; i < 13; i++) {
    soma += parseInt(cleanCnpj.charAt(i)) * pos--;
    if (pos < 2) pos = 9;
  }

  resto = soma % 11;
  const digito2 = resto < 2 ? 0 : 11 - resto;

  return parseInt(cleanCnpj.charAt(13)) === digito2;
}

/**
 * Formata CNPJ (mantém lógica existente)
 */
export function formatCNPJ(cnpj?: string | null): string {
  if (!cnpj) return "";
  const cleanCnpj = cnpj.replace(/\D/g, "");
  if (cleanCnpj.length !== 14) return cnpj;
  return cleanCnpj.replace(
    /(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/,
    "$1.$2.$3/$4-$5"
  );
}

/**
 * Formata telefone (mantém lógica existente)
 */
export function formatPhone(telefone?: string | null): string {
  if (!telefone) return "";
  const cleanTelefone = telefone.replace(/\D/g, "");

  if (cleanTelefone.length === 11) {
    return cleanTelefone.replace(/(\d{2})(\d{5})(\d{4})/, "($1) $2-$3");
  } else if (cleanTelefone.length === 10) {
    return cleanTelefone.replace(/(\d{2})(\d{4})(\d{4})/, "($1) $2-$3");
  }

  return telefone;
}

/**
 * Limpa string removendo caracteres não numéricos
 */
export function cleanNumericString(value?: string | null): string | undefined {
  if (!value) return undefined;
  const cleaned = value.replace(/\D/g, "");
  return cleaned || undefined;
}

// ============================================================================
// DATABASE ENTITY → RESPONSE DTO
// ============================================================================

/**
 * Converte OrganizationEntity (banco) para OrganizationResponseDto (API)
 */
export function toOrganizationResponseDto(
  entity: OrganizationEntity
): OrganizationResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    type: entity.type,
    cnpj: entity.cnpj,
    capacity: entity.capacity,
    openingDate: entity.opening_date,
    stateId: entity.state_id,
    cityId: entity.city_id,
    zipCode: entity.zip_code,
    address: entity.address,
    number: entity.number,
    addressComplement: entity.address_complement,
    district: entity.district,
    fullAddress: entity.full_address,
    latitude: entity.latitude,
    longitude: entity.longitude,
    mainPhone: entity.main_phone,
    altPhone: entity.alt_phone,
    institutionalEmail: entity.institutional_email,
    userId: entity.user_id,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

/**
 * Converte OrganizationEntity com relacionamentos para OrganizationExpandedResponseDto
 */
export function toOrganizationExpandedResponseDto(
  entity: OrganizationEntity & {
    state?: StateEntity;
    city?: CityEntity & { state?: StateEntity };
  }
): OrganizationExpandedResponseDto {
  const base = toOrganizationResponseDto(entity);

  return {
    ...base,
    state: entity.state
      ? {
          id: entity.state.id,
          code: entity.state.code,
          name: entity.state.name,
          region: entity.state.region,
        }
      : undefined,
    city: entity.city
      ? {
          id: entity.city.id,
          name: entity.city.name,
          ibgeCode: entity.city.ibge_code,
          state: entity.city.state
            ? {
                id: entity.city.state.id,
                code: entity.city.state.code,
                name: entity.city.state.name,
              }
            : undefined,
        }
      : undefined,
  };
}

/**
 * Converte DepartmentEntity para DTO simples
 */
export function toDepartmentDto(entity: DepartmentEntity) {
  return {
    id: entity.id,
    name: entity.name,
    organizationId: entity.organization_id,
    departmentType: entity.department_type,
    createdAt: entity.created_at,
  };
}

// ============================================================================
// RESPONSE DTO → FRONTEND MODEL
// ============================================================================

/**
 * Converte OrganizationResponseDto para Organization (modelo frontend)
 * Adiciona Date objects e computed fields
 */
export function toOrganizationModel(
  dto: OrganizationResponseDto
): Organization {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type as OrganizationType | null,
    cnpj: dto.cnpj,
    capacity: dto.capacity,
    openingDate: dto.openingDate ? new Date(dto.openingDate) : null,
    stateId: dto.stateId,
    cityId: dto.cityId,
    zipCode: dto.zipCode,
    address: dto.address,
    number: dto.number,
    addressComplement: dto.addressComplement,
    district: dto.district,
    fullAddress: dto.fullAddress,
    latitude: dto.latitude,
    longitude: dto.longitude,
    mainPhone: dto.mainPhone,
    altPhone: dto.altPhone,
    institutionalEmail: dto.institutionalEmail,
    userId: dto.userId,
    createdAt: new Date(dto.createdAt),
    updatedAt: new Date(dto.updatedAt),

    // Computed fields (formatação)
    formattedCnpj: formatCNPJ(dto.cnpj),
    formattedMainPhone: formatPhone(dto.mainPhone),
    formattedAltPhone: formatPhone(dto.altPhone),
  };
}

/**
 * Converte OrganizationExpandedResponseDto para Organization com relacionamentos
 */
export function toOrganizationExpandedModel(
  dto: OrganizationExpandedResponseDto
): Organization {
  const base = toOrganizationModel(dto);

  return {
    ...base,
    state: dto.state
      ? {
          id: dto.state.id,
          code: dto.state.code,
          name: dto.state.name,
          region: dto.state.region,
          createdAt: new Date(), // Estado não tem created_at no DTO simplificado
        }
      : undefined,
    city: dto.city
      ? {
          id: dto.city.id,
          stateId: dto.city.state?.id ?? 0,
          ibgeCode: dto.city.ibgeCode,
          name: dto.city.name,
          zipCodeStart: null,
          zipCodeEnd: null,
          latitude: null,
          longitude: null,
          createdAt: new Date(),
          updatedAt: new Date(),
        }
      : undefined,
  };
}

/**
 * Converte Department DTO para Department model
 */
export function toDepartmentModel(
  dto: ReturnType<typeof toDepartmentDto>
): Department {
  return {
    id: dto.id,
    name: dto.name,
    organizationId: dto.organizationId,
    departmentType: dto.departmentType,
    createdAt: new Date(dto.createdAt),
  };
}

// ============================================================================
// REQUEST DTO → DATABASE ENTITY (para INSERT/UPDATE)
// ============================================================================

/**
 * Converte CreateOrganizationDto para OrganizationEntity (para insert)
 * Aplica regras de limpeza de dados (telefone, CNPJ, etc.)
 *
 * Nota: userId deve ser passado separadamente, não vem no DTO
 */
export function toOrganizationEntityForCreate(
  dto: CreateOrganizationDto,
  userId?: string
): Omit<OrganizationEntity, "id" | "created_at" | "updated_at"> {
  return {
    name: dto.name,
    type: dto.type ?? null,
    // REGRA: Limpar CNPJ (remover caracteres não numéricos)
    cnpj: cleanNumericString(dto.cnpj) ?? null,
    capacity: dto.capacity ?? null,
    opening_date: dto.openingDate ?? null,
    state_id: dto.stateId ?? null,
    city_id: dto.cityId ?? null,
    zip_code: dto.zipCode ?? null,
    address: dto.address ?? null,
    number: dto.number ?? null,
    address_complement: dto.addressComplement ?? null,
    district: dto.district ?? null,
    full_address: dto.fullAddress ?? null,
    latitude: dto.latitude ?? null,
    longitude: dto.longitude ?? null,
    // REGRA: Limpar telefones (remover caracteres não numéricos)
    main_phone: cleanNumericString(dto.mainPhone) ?? null,
    alt_phone: cleanNumericString(dto.altPhone) ?? null,
    institutional_email: dto.institutionalEmail ?? null,
    user_id: userId ?? null,
  };
}

/**
 * Converte UpdateOrganizationDto para Partial<OrganizationEntity> (para update)
 * Aplica regras de limpeza e adiciona updatedAt automático
 */
export function toOrganizationEntityForUpdate(
  dto: UpdateOrganizationDto
): Partial<OrganizationEntity> {
  const entity: Partial<OrganizationEntity> = {};

  if (dto.name !== undefined) entity.name = dto.name;
  if (dto.type !== undefined) entity.type = dto.type ?? null;
  // REGRA: Limpar CNPJ
  if (dto.cnpj !== undefined)
    entity.cnpj = cleanNumericString(dto.cnpj) ?? null;
  if (dto.capacity !== undefined) entity.capacity = dto.capacity ?? null;
  if (dto.openingDate !== undefined)
    entity.opening_date = dto.openingDate ?? null;
  if (dto.stateId !== undefined) entity.state_id = dto.stateId ?? null;
  if (dto.cityId !== undefined) entity.city_id = dto.cityId ?? null;
  if (dto.zipCode !== undefined) entity.zip_code = dto.zipCode ?? null;
  if (dto.address !== undefined) entity.address = dto.address ?? null;
  if (dto.number !== undefined) entity.number = dto.number ?? null;
  if (dto.addressComplement !== undefined)
    entity.address_complement = dto.addressComplement ?? null;
  if (dto.district !== undefined) entity.district = dto.district ?? null;
  if (dto.fullAddress !== undefined)
    entity.full_address = dto.fullAddress ?? null;
  if (dto.latitude !== undefined) entity.latitude = dto.latitude ?? null;
  if (dto.longitude !== undefined) entity.longitude = dto.longitude ?? null;
  // REGRA: Limpar telefones
  if (dto.mainPhone !== undefined)
    entity.main_phone = cleanNumericString(dto.mainPhone) ?? null;
  if (dto.altPhone !== undefined)
    entity.alt_phone = cleanNumericString(dto.altPhone) ?? null;
  if (dto.institutionalEmail !== undefined)
    entity.institutional_email = dto.institutionalEmail ?? null;

  // REGRA: Atualizar updatedAt automaticamente
  entity.updated_at = new Date().toISOString();

  return entity;
}

// ============================================================================
// UTILIDADES ADICIONAIS
// ============================================================================

/**
 * Converte array de entities para array de DTOs
 */
export function toOrganizationResponseDtoList(
  entities: OrganizationEntity[]
): OrganizationResponseDto[] {
  return entities.map(toOrganizationResponseDto);
}

/**
 * Converte array de DTOs para array de models
 */
export function toOrganizationModelList(
  dtos: OrganizationResponseDto[]
): Organization[] {
  return dtos.map(toOrganizationModel);
}

/**
 * Converte array de entities expandidas para array de models
 */
export function toOrganizationExpandedModelList(
  entities: (OrganizationEntity & {
    state?: StateEntity;
    city?: CityEntity & { state?: StateEntity };
  })[]
): Organization[] {
  return entities.map((entity) =>
    toOrganizationExpandedModel(toOrganizationExpandedResponseDto(entity))
  );
}
