import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ProfileEntity,
  UserOrganizationEntity,
} from "@/types/database/profile";
import { MemberResponseDto } from "@/types/dto/member/response";
import { toMemberResponseDto } from "@/lib/converters/member";

type UserOrganizationWithProfile = UserOrganizationEntity & {
  profile?: ProfileEntity;
};

interface BasicUserInfo {
  id: string;
  email?: string;
  name?: string;
  avatar_url?: string | null;
  avatarUrl?: string | null;
  picture?: string | null;
}

/**
 * Backend service para listagem de membros/integrantes
 */
export class MemberBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Lista membros vinculados a uma organização específica
   */
  async listMembersByOrganization(
    organizationId: string
  ): Promise<MemberResponseDto[]> {
    if (!organizationId) {
      throw new Error("Organization id is required");
    }

    const { data, error } = await this.supabase
      .from("user_organizations")
      .select(
        `
        *,
        profile:profiles(*)
      `
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Error while fetching members");
    }

    const entities = (data ?? []) as UserOrganizationWithProfile[];
    const uniqueUserIds = Array.from(
      new Set(entities.map((entity) => entity.user_id))
    );

    let usersMap = new Map<string, BasicUserInfo>();
    if (uniqueUserIds.length > 0) {
      const { data: usersData, error: usersError } = await this.supabase.rpc(
        "get_multiple_users_data",
        { user_ids: uniqueUserIds }
      );

      if (usersError) {
        throw new Error(
          usersError.message || "Error while loading member user data"
        );
      }

      (usersData as BasicUserInfo[] | null)?.forEach((user) => {
        if (user?.id) {
          usersMap.set(user.id, user);
        }
      });
    }

    return entities.map((entity) =>
      toMemberResponseDto(entity, usersMap.get(entity.user_id))
    );
  }
}
