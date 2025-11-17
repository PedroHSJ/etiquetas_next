import type { SupabaseClient } from "@supabase/supabase-js";
import {
  ProfileEntity,
  UserProfileEntity,
  UserOrganizationEntity,
} from "@/types/database/profile";
import { OrganizationEntity } from "@/types/database/organization";
import { toOrganizationResponseDto } from "@/lib/converters/organization";
import {
  ProfileResponseDto,
  UserProfileResponseDto,
} from "@/types/dto/profile";

interface ListProfilesOptions {
  search?: string;
  activeOnly?: boolean;
}

/**
 * Converter: ProfileEntity → ProfileResponseDto
 */
function toProfileResponseDto(entity: ProfileEntity): ProfileResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    description: entity.description,
    active: entity.active,
    createdAt: entity.created_at,
  };
}

/**
 * Entity com join para user_profiles
 */
interface UserProfileWithRelations {
  id: string;
  user_organization_id: string;
  profile_id: string;
  active: boolean;
  start_date: string;
  created_at: string;
  profile?: ProfileEntity;
  user_organization?: UserOrganizationEntity & {
    organization?: OrganizationEntity;
  };
}

/**
 * Converter: UserProfileEntity → UserProfileResponseDto
 */
function toUserProfileResponseDto(
  entity: UserProfileWithRelations
): UserProfileResponseDto {
  return {
    id: entity.id,
    userOrganizationId: entity.user_organization_id,
    profileId: entity.profile_id,
    active: entity.active,
    startDate: entity.start_date,
    createdAt: entity.created_at,
    profile: entity.profile ? toProfileResponseDto(entity.profile) : undefined,
    userOrganization: entity.user_organization?.organization
      ? {
          organization: toOrganizationResponseDto(
            entity.user_organization.organization
          ),
        }
      : undefined,
  };
}

/**
 * Service layer for profile management
 */
export class ProfileBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  private slugify(value: string): string {
    return value
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  /**
   * List all profiles with optional filters
   */
  async listProfiles(
    options: ListProfilesOptions = {}
  ): Promise<ProfileResponseDto[]> {
    const { search, activeOnly = true } = options;
    let query = this.supabase.from("profiles").select("*");

    if (activeOnly) {
      query = query.eq("active", true);
    }

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    query = query.order("name", { ascending: true });

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message || "Error while fetching profiles");
    }

    const entities = (data ?? []) as ProfileEntity[];

    return entities.map((entity) => ({
      ...toProfileResponseDto(entity),
      slug: this.slugify(entity.name),
    }));
  }

  /**
   * Get profile by slug
   */
  async getProfileBySlug(slug: string): Promise<ProfileResponseDto | null> {
    if (!slug) {
      return null;
    }

    const normalizedSlug = this.slugify(slug);
    const profiles = await this.listProfiles({ activeOnly: true });

    return (
      profiles.find(
        (profile) => this.slugify(profile.name) === normalizedSlug
      ) ?? null
    );
  }

  /**
   * Busca todos os perfis disponíveis para o usuário informado
   * @param userId id do usuário (auth.users)
   */
  async getAvailableProfiles(
    userId: string
  ): Promise<UserProfileResponseDto[]> {
    try {
      // Buscar user_profiles através de user_organizations
      const { data, error } = await this.supabase
        .from("user_profiles")
        .select(
          `
          *,
          profile:profiles(*),
          user_organization:user_organizations!inner(
            *,
            organization:organizations(*)
          )
        `
        )
        // Importante: o filtro deve usar o nome da tabela real (user_organizations),
        // não o alias (user_organization), para o Supabase aplicar corretamente.
        .eq("user_organizations.user_id", userId)
        .eq("active", true);
      console.log("userId:", userId);

      if (error) {
        throw new Error(error.message || "Error fetching user profiles");
      }

      const entities = (data ?? []) as UserProfileWithRelations[];
      return entities.map(toUserProfileResponseDto);
    } catch (error) {
      console.error("Erro ao buscar perfis:", error);
      throw new Error("Erro ao buscar perfis do usuário");
    }
  }
}
