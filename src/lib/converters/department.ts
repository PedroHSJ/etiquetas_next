import { DepartmentEntity, OrganizationEntity } from "@/types/database/organization";
import {
  DepartmentResponseDto,
  DepartmentWithOrganizationResponseDto,
} from "@/types/dto/department";
import {
  Department,
  DepartmentWithOrganization,
} from "@/types/models/department";
import { OrganizationResponseDto } from "@/types/dto/organization/response";
import { toOrganizationModel } from "@/lib/converters/organization";

/**
 * Converte DepartmentEntity (banco) para DepartmentResponseDto (API)
 */
export function toDepartmentResponseDto(
  entity: DepartmentEntity
): DepartmentResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    organizationId: entity.organization_id,
    departmentType: entity.department_type,
    createdAt: entity.created_at,
  };
}

/**
 * Converte DepartmentEntity com organização para DepartmentWithOrganizationResponseDto
 */
export function toDepartmentWithOrganizationResponseDto(
  entity: DepartmentEntity & {
    organization?: OrganizationEntity;
  }
): DepartmentWithOrganizationResponseDto {
  return {
    ...toDepartmentResponseDto(entity),
    organization: entity.organization
      ? {
          id: entity.organization.id,
          name: entity.organization.name,
          type: entity.organization.type,
        }
      : undefined,
  };
}

/**
 * Converte DepartmentResponseDto para Department (modelo frontend)
 */
export function toDepartmentModel(dto: DepartmentResponseDto): Department {
  return {
    id: dto.id,
    name: dto.name,
    organizationId: dto.organizationId,
    departmentType: dto.departmentType,
    createdAt: new Date(dto.createdAt),
  };
}

/**
 * Converte DepartmentWithOrganizationResponseDto para DepartmentWithOrganization (modelo frontend)
 */
export function toDepartmentWithOrganizationModel(
  dto: DepartmentWithOrganizationResponseDto
): DepartmentWithOrganization {
  return {
    ...toDepartmentModel(dto),
    organization: dto.organization
      ? toOrganizationModel(dto.organization as OrganizationResponseDto)
      : undefined,
  };
}

export function toDepartmentModelList(
  dtos: DepartmentResponseDto[]
): Department[] {
  return dtos.map(toDepartmentModel);
}

export function toDepartmentWithOrganizationModelList(
  dtos: DepartmentWithOrganizationResponseDto[]
): DepartmentWithOrganization[] {
  return dtos.map(toDepartmentWithOrganizationModel);
}

