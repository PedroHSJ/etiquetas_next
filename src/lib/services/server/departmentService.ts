import type { SupabaseClient } from "@supabase/supabase-js";
import { DepartmentEntity, OrganizationEntity } from "@/types/database/organization";
import { UserOrganizationEntity } from "@/types/database/profile";
import {
  DepartmentResponseDto,
  DepartmentWithOrganizationResponseDto,
  CreateDepartmentDto,
  UpdateDepartmentDto,
  ListDepartmentsDto,
} from "@/types/dto/department";
import {
  toDepartmentResponseDto,
  toDepartmentWithOrganizationResponseDto,
} from "@/lib/converters/department";

/**
 * Backend service para gerenciar departments e user_organizations
 */
export class DepartmentBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Cria múltiplos departments para uma organização
   */
  async createDepartments(
    organizationId: string,
    departments: Array<{ name: string; departmentType: string }>
  ) {
    const departmentInserts = departments.map((dept) => ({
      name: dept.name,
      organization_id: organizationId,
      department_type: dept.departmentType,
    }));

    const { data, error } = await this.supabase
      .from("departments")
      .insert(departmentInserts)
      .select();

    if (error) {
      throw new Error(error.message || "Error while creating departments");
    }

    return data as DepartmentEntity[];
  }

  /**
   * Lista departments, opcionalmente filtrando por organização e termo de busca
   */
  async listDepartments(
    params: ListDepartmentsDto = {}
  ): Promise<DepartmentWithOrganizationResponseDto[]> {
    const { organizationId, search } = params;

    let query = this.supabase
      .from("departments")
      .select(
        `
        *,
        organization:organizations(id, name, type)
      `
      )
      .order("created_at", { ascending: false });

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message || "Error while fetching departments");
    }

    type EntityWithOrg = DepartmentEntity & {
      organization?: OrganizationEntity;
    };

    const entities = (data ?? []) as EntityWithOrg[];
    return entities.map(toDepartmentWithOrganizationResponseDto);
  }

  /**
   * Busca um department por ID
   */
  async getDepartmentById(
    id: string
  ): Promise<DepartmentWithOrganizationResponseDto | null> {
    const { data, error } = await this.supabase
      .from("departments")
      .select(
        `
        *,
        organization:organizations(id, name, type)
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Not found
        return null;
      }
      throw new Error(error.message || "Error while fetching department");
    }

    type EntityWithOrg = DepartmentEntity & {
      organization?: OrganizationEntity;
    };

    return toDepartmentWithOrganizationResponseDto(
      data as EntityWithOrg
    );
  }

  /**
   * Cria um único department
   */
  async createDepartment(
    dto: CreateDepartmentDto
  ): Promise<DepartmentResponseDto> {
    const payload = {
      name: dto.name,
      organization_id: dto.organizationId,
      department_type: dto.departmentType ?? null,
    };

    const { data, error } = await this.supabase
      .from("departments")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error while creating department");
    }

    return toDepartmentResponseDto(data as DepartmentEntity);
  }

  /**
   * Atualiza um department
   */
  async updateDepartment(
    id: string,
    dto: UpdateDepartmentDto
  ): Promise<DepartmentResponseDto> {
    const payload: Partial<DepartmentEntity> = {};

    if (dto.name !== undefined) {
      payload.name = dto.name;
    }
    if (dto.departmentType !== undefined) {
      payload.department_type = dto.departmentType;
    }

    const { data, error } = await this.supabase
      .from("departments")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error while updating department");
    }

    return toDepartmentResponseDto(data as DepartmentEntity);
  }

  /**
   * Exclui um department
   */
  async deleteDepartment(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("departments")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message || "Error while deleting department");
    }
  }

  /**
   * Vincula usuário a uma organização com um perfil
   */
  async linkUserToOrganization(
    userId: string,
    organizationId: string,
    profileId: string
  ) {
    const { data: userOrganization, error: userOrgError } = await this.supabase
      .from("user_organizations")
      .insert({
        user_id: userId,
        organization_id: organizationId,
        profile_id: profileId,
        active: true,
      })
      .select()
      .single();

    if (userOrgError || !userOrganization) {
      throw new Error(
        userOrgError?.message || "Error while linking user to organization"
      );
    }

    return userOrganization as UserOrganizationEntity;
  }

  /**
   * Cria user_profile para um user_organization
   */
  async createUserProfile(userOrganizationId: string, profileId: string) {
    const { error } = await this.supabase.from("user_profiles").insert({
      user_organization_id: userOrganizationId,
      profile_id: profileId,
      active: true,
    });

    if (error) {
      throw new Error(error.message || "Error while creating user profile");
    }
  }
}
