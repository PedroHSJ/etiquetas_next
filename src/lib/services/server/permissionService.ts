import type {
  ProfileEntity,
  FunctionalityEntity,
  PermissionEntity,
} from "@/types/database/profile";
import { SupabaseClient } from "@supabase/supabase-js";

/**
 * Backend service for permission management
 * Returns database entities (snake_case) - conversion to Models happens in API layer
 */
export class PermissionBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Verifica se um usuário tem permissão para uma ação específica
   */
  async hasPermission(
    functionalityName: string,
    action: string,
    userId: string,
    organizationId: string
  ): Promise<boolean | null> {
    try {
      // Buscar user_organization, perfis e permissões em uma query aninhada
      const { data: usuarioOrg, error } = await this.supabase
        .from("user_organizations")
        .select(
          `
          id,
          user_profiles:user_profiles!user_profiles_user_organization_id_fkey (
            id,
            profile:profiles (
              id,
              name
            ),
            permissions:permissions!permissions_profile_id_fkey (
              id,
              action,
              functionality:functionalities (
                id,
                name
              )
            )
          )
        `
        )
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .eq("active", true)
        .single();

      if (error || !usuarioOrg) {
        console.error(
          "Erro ao buscar usuário organização/perfis/permissões:",
          error
        );
        return false;
      }

      for (const userProfile of usuarioOrg.user_profiles || []) {
        // Supabase pode retornar profile como array
        const pArr = userProfile.profile;
        const p = Array.isArray(pArr) ? pArr[0] : pArr;
        if (p && p.name === "master") {
          return true;
        }
        for (const perm of userProfile.permissions || []) {
          const funcArr = perm.functionality;
          const func = Array.isArray(funcArr) ? funcArr[0] : funcArr;
          if (
            perm.action === action &&
            func &&
            func.name === functionalityName
          ) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Erro ao verificar permissão:", error);
      return false;
    }
  }

  async getUserPermissions(
    userId: string,
    organizationId: string
  ): Promise<{
    user_id: string;
    organization_id: string;
    permissions: PermissionEntity[];
    profiles: ProfileEntity[];
  } | null> {
    // First get user_organization
    const { data: usuarioOrg, error: orgError } = await this.supabase
      .from("user_organizations")
      .select("id")
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("active", true)
      .single();

    if (orgError || !usuarioOrg) {
      console.error("Erro ao buscar user_organization:", orgError);
      return null;
    }

    // Get user_profiles with profiles
    const { data: userProfiles, error: profilesError } = await this.supabase
      .from("user_profiles")
      .select(
        `
        id,
        profile_id,
        profile:profiles (
          id,
          name,
          description,
          active,
          created_at
        )
      `
      )
      .eq("user_organization_id", usuarioOrg.id)
      .eq("active", true);

    if (profilesError) {
      console.error("Erro ao buscar perfis:", profilesError);
      return null;
    }

    const perfis: ProfileEntity[] = [];
    const profileIds: string[] = [];

    for (const userProfile of userProfiles || []) {
      const p = userProfile.profile as any;
      if (p && !Array.isArray(p)) {
        perfis.push({
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
          created_at: p.created_at,
        });
        profileIds.push(p.id);
      }
    }

    // Get permissions for all profiles
    const { data: permissions, error: permError } = await this.supabase
      .from("permissions")
      .select(
        `
        id,
        action,
        functionality_id,
        profile_id,
        active,
        created_at,
        functionality:functionalities (
          id,
          name,
          description,
          category,
          route,
          active,
          created_at
        )
      `
      )
      .in("profile_id", profileIds)
      .eq("active", true);

    if (permError) {
      console.error("Erro ao buscar permissões:", permError);
      return null;
    }

    const permissoes: PermissionEntity[] = (permissions || []).map((perm) => {
      const func = perm.functionality as any;
      return {
        id: perm.id,
        functionality_id: perm.functionality_id || "",
        profile_id: perm.profile_id || "",
        action: perm.action,
        active: perm.active,
        created_at: perm.created_at,
        functionality:
          func && !Array.isArray(func)
            ? {
                id: func.id,
                name: func.name,
                description: func.description,
                category: func.category,
                route: func.route,
                active: func.active,
                created_at: func.created_at,
              }
            : undefined,
      };
    });

    return {
      user_id: userId,
      organization_id: organizationId,
      permissions: permissoes,
      profiles: perfis,
    };
  }

  async getUserProfiles(
    userId: string,
    organizationId: string
  ): Promise<ProfileEntity[]> {
    const { data, error } = await this.supabase
      .from("user_organizations")
      .select(
        `
        user_profiles:user_profiles!user_profiles_user_organization_id_fkey (
          profile:profiles (
            id,
            name,
            description,
            active,
            created_at
          )
        )
      `
      )
      .eq("user_id", userId)
      .eq("organization_id", organizationId)
      .eq("active", true)
      .single();

    if (error || !data) {
      console.error("Erro ao buscar perfis do usuário:", error);
      return [];
    }

    const perfis: ProfileEntity[] = [];

    for (const userProfile of data.user_profiles || []) {
      const pArr = userProfile.profile;
      const p = Array.isArray(pArr) ? pArr[0] : pArr;
      if (p) {
        perfis.push({
          id: p.id,
          name: p.name,
          description: p.description,
          active: p.active,
          created_at: p.created_at,
        });
      }
    }
    return perfis;
  }

  async getFunctionalities(): Promise<FunctionalityEntity[]> {
    const { data, error } = await this.supabase
      .from("functionalities")
      .select("*");

    if (error) {
      console.error("Erro ao buscar funcionalidades:", error);
      throw new Error("Error fetching functionalities");
    }

    return data ? data : [];
  }

  async getPermissions(): Promise<PermissionEntity[]> {
    const { data, error } = await this.supabase
      .from("permissions")
      .select(
        `
            *,
            functionality:functionalities (
              id,
              name,
              description,
              category,
              route,
              active
            ),
            profile:profiles (
              id,
              name,
              description
            )
          `
      )
      .eq("active", true)
      .order("functionality_id", { ascending: true })
      .order("action", { ascending: true });

    if (error) {
      console.error("Erro ao buscar permissões:", error);
      throw new Error("Error fetching permissions");
    }

    return data ? data : [];
  }

  /**
   * Atualiza as permissões de um perfil
   */
  async updateProfilePermissions(
    functionalityName: string,
    action: string,
    userId: string,
    organizationId: string
  ): Promise<boolean | null> {
    try {
      // Buscar user_organization, perfis e permissões em uma query aninhada
      const { data: usuarioOrg, error } = await this.supabase
        .from("user_organizations")
        .select(
          `
          id,
          user_profiles:user_profiles!user_profiles_user_organization_id_fkey (
            id,
            profile:profiles (
              id,
              name
            ),
            permissions:permissions!permissions_profile_id_fkey (
              id,
              action,
              functionality:functionalities (
                id,
                name
              )
            )
          )
        `
        )
        .eq("user_id", userId)
        .eq("organization_id", organizationId)
        .eq("active", true)
        .single();

      if (error || !usuarioOrg) {
        console.error(
          "Erro ao buscar usuário organização/perfis/permissões:",
          error
        );
        return null;
      }

      for (const userProfile of usuarioOrg.user_profiles || []) {
        // Supabase pode retornar profile como array
        const pArr = userProfile.profile;
        const p = Array.isArray(pArr) ? pArr[0] : pArr;
        if (p && p.name === "master") {
          return true;
        }
        for (const perm of userProfile.permissions || []) {
          const funcArr = perm.functionality;
          const func = Array.isArray(funcArr) ? funcArr[0] : funcArr;
          if (
            perm.action === action &&
            func &&
            func.name === functionalityName
          ) {
            return true;
          }
        }
      }
      return false;
    } catch (error) {
      console.error("Erro ao atualizar permissões do perfil:", error);
      return null;
    }
  }

  /**
   * Atribui um perfil de usuário a um usuário
   */
  async assignProfileToUser(
    userOrganizationId: string,
    profileId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase.from("user_profiles").upsert(
        {
          user_organization_id: userOrganizationId,
          profile_id: profileId,
          active: true,
          start_date: new Date().toISOString(),
        },
        { onConflict: "user_organization_id,profile_id" }
      );

      if (error) {
        console.error(
          "Erro ao atribuir perfil ao usuário:",
          error.message || error
        );
        return false;
      }
      return true;
    } catch (error: any) {
      console.error(
        "Erro ao atribuir perfil ao usuário:",
        error.message || error
      );
      return false;
    }
  }

  /**
   * Remove um perfil de usuário de um usuário
   */
  async removeProfileFromUser(
    userOrganizationId: string,
    profileId: string
  ): Promise<boolean> {
    try {
      const { error } = await this.supabase
        .from("user_profiles")
        .update({ active: false })
        .eq("user_organization_id", userOrganizationId)
        .eq("profile_id", profileId);

      if (error) {
        throw new Error(error.message);
      }
      return true;
    } catch (error: any) {
      throw new Error(error.message || "Erro ao remover perfil do usuário");
    }
  }
}
