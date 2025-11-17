import type { SupabaseClient } from "@supabase/supabase-js";
import { OrganizationEntity } from "@/types/database/organization";
import {
  toOrganizationResponseDto,
  toOrganizationExpandedResponseDto,
  toOrganizationEntityForCreate,
  toOrganizationEntityForUpdate,
  toOrganizationResponseDtoList,
} from "@/lib/converters/organization";
import {
  CreateOrganizationDto,
  UpdateOrganizationDto,
} from "@/types/dto/organization/request";
import {
  OrganizationResponseDto,
  OrganizationExpandedResponseDto,
} from "@/types/dto/organization/response";
import { StateEntity, CityEntity } from "@/types/database/location";

/**
 * Service layer used by the API routes to manage organizations.
 */
export class OrganizationBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Returns every organization the user created OR belongs to.
   */
  async listByUserId(userId: string): Promise<OrganizationResponseDto[]> {
    // 1) Organizations created by the user
    const { data: owned, error: ownedError } = await this.supabase
      .from("organizations")
      .select("*")
      .eq("created_by", userId);

    if (ownedError) {
      throw new Error(
        ownedError.message || "Error while fetching owned organizations"
      );
    }

    // 2) Organizations where the user is a member (user_organizations)
    const { data: memberships, error: membershipsError } = await this.supabase
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("active", true);

    if (membershipsError) {
      throw new Error(
        membershipsError.message || "Error while fetching user organizations"
      );
    }

    const memberOrgIds = (memberships ?? []).map(
      (m: any) => m.organization_id as string
    );

    let memberOrgs: OrganizationEntity[] = [];
    if (memberOrgIds.length > 0) {
      const { data: memberData, error: memberError } = await this.supabase
        .from("organizations")
        .select("*")
        .in("id", memberOrgIds);

      if (memberError) {
        throw new Error(
          memberError.message || "Error while fetching member organizations"
        );
      }

      memberOrgs = (memberData ?? []) as OrganizationEntity[];
    }

    // 3) Merge and deduplicate by organization id
    const map = new Map<string, OrganizationEntity>();
    for (const org of (owned ?? []) as OrganizationEntity[]) {
      map.set(org.id, org);
    }
    for (const org of memberOrgs) {
      map.set(org.id, org);
    }

    const combined = Array.from(map.values());
    combined.sort((a, b) =>
      (b.created_at || "").localeCompare(a.created_at || "")
    );

    return toOrganizationResponseDtoList(combined);
  }

  async createOrganization(
    dto: CreateOrganizationDto,
    userId: string
  ): Promise<OrganizationResponseDto> {
    // Usa converter para transformar DTO → Entity (com limpeza de CNPJ/telefone)
    const payload = toOrganizationEntityForCreate(dto, userId);

    const { data, error } = await this.supabase
      .from("organizations")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error while creating organization");
    }

    const entity = data as OrganizationEntity;
    return toOrganizationResponseDto(entity);
  }

  async updateOrganization(
    id: string,
    dto: UpdateOrganizationDto
  ): Promise<OrganizationResponseDto> {
    // Usa converter para transformar DTO → Entity (com limpeza + updatedAt)
    const payload = toOrganizationEntityForUpdate(dto);

    const { data, error } = await this.supabase
      .from("organizations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error while updating organization");
    }

    const entity = data as OrganizationEntity;
    return toOrganizationResponseDto(entity);
  }

  /**
   * Get organization by ID with expanded state/city
   */
  async getByIdExpanded(id: string): Promise<OrganizationExpandedResponseDto> {
    const { data, error } = await this.supabase
      .from("organizations")
      .select(
        `
        *,
        state:states(*),
        city:cities(*, state:states(*))
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      throw new Error(error.message || "Error while fetching organization");
    }

    type ExpandedEntity = OrganizationEntity & {
      state?: StateEntity;
      city?: CityEntity & { state?: StateEntity };
    };

    return toOrganizationExpandedResponseDto(data as ExpandedEntity);
  }

  /**
   * Update organization and return expanded data
   */
  async updateExpanded(
    id: string,
    dto: UpdateOrganizationDto
  ): Promise<OrganizationExpandedResponseDto> {
    // Usa converter (já aplica limpeza de telefone/CNPJ e updatedAt)
    const payload = toOrganizationEntityForUpdate(dto);

    const { data, error } = await this.supabase
      .from("organizations")
      .update(payload)
      .eq("id", id)
      .select(
        `
        *,
        state:states(*),
        city:cities(*, state:states(*))
      `
      )
      .single();

    if (error) {
      throw new Error(error.message || "Error while updating organization");
    }

    type ExpandedEntity = OrganizationEntity & {
      state?: StateEntity;
      city?: CityEntity & { state?: StateEntity };
    };

    return toOrganizationExpandedResponseDto(data as ExpandedEntity);
  }

  /**
   * Get all organizations for a user with expanded state/city
   */
  async listByUserIdExpanded(
    userId: string
  ): Promise<OrganizationExpandedResponseDto[]> {
    // 1) Organizations created by the user (expanded)
    const { data: owned, error: ownedError } = await this.supabase
      .from("organizations")
      .select(
        `
        *,
        state:states(*),
        city:cities(*, state:states(*))
      `
      )
      .eq("created_by", userId);

    if (ownedError) {
      throw new Error(
        ownedError.message || "Error while fetching owned organizations"
      );
    }

    // 2) Organizations where the user is a member
    const { data: memberships, error: membershipsError } = await this.supabase
      .from("user_organizations")
      .select("organization_id")
      .eq("user_id", userId)
      .eq("active", true);

    if (membershipsError) {
      throw new Error(
        membershipsError.message || "Error while fetching user organizations"
      );
    }

    const memberOrgIds = (memberships ?? []).map(
      (m: any) => m.organization_id as string
    );

    type ExpandedEntity = OrganizationEntity & {
      state?: StateEntity;
      city?: CityEntity & { state?: StateEntity };
    };

    let memberOrgs: ExpandedEntity[] = [];
    if (memberOrgIds.length > 0) {
      const { data: memberData, error: memberError } = await this.supabase
        .from("organizations")
        .select(
          `
          *,
          state:states(*),
          city:cities(*, state:states(*))
        `
        )
        .in("id", memberOrgIds);

      if (memberError) {
        throw new Error(
          memberError.message || "Error while fetching member organizations"
        );
      }

      memberOrgs = (memberData ?? []) as ExpandedEntity[];
    }

    // 3) Merge and deduplicate
    const map = new Map<string, ExpandedEntity>();
    for (const org of (owned ?? []) as ExpandedEntity[]) {
      map.set(org.id, org);
    }
    for (const org of memberOrgs) {
      map.set(org.id, org);
    }

    const combined = Array.from(map.values());
    combined.sort((a, b) => (a.name || "").localeCompare(b.name || ""));

    return combined.map(toOrganizationExpandedResponseDto);
  }
}
