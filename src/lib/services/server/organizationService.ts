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
   * Returns every organization linked to the authenticated user.
   */
  async listByUserId(userId: string): Promise<OrganizationResponseDto[]> {
    const { data, error } = await this.supabase
      .from("organizations")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message || "Error while fetching organizations");
    }

    const entities = data as OrganizationEntity[];
    return toOrganizationResponseDtoList(entities);
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
    const { data, error } = await this.supabase
      .from("organizations")
      .select(
        `
        *,
        state:states(*),
        city:cities(*, state:states(*))
      `
      )
      .eq("user_id", userId)
      .order("name");

    if (error) {
      throw new Error(error.message || "Error while fetching organizations");
    }

    type ExpandedEntity = OrganizationEntity & {
      state?: StateEntity;
      city?: CityEntity & { state?: StateEntity };
    };

    const entities = data as ExpandedEntity[];
    return entities.map(toOrganizationExpandedResponseDto);
  }
}
