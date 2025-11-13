import type { SupabaseClient } from "@supabase/supabase-js";
import { DepartmentEntity } from "@/types/database/organization";
import { UserOrganizationEntity } from "@/types/database/profile";

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
