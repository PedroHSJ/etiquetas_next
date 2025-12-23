import type { SupabaseClient } from "@supabase/supabase-js";
import { StorageLocationEntity } from "@/types/database/storage-location";
import {
  CreateStorageLocationDto,
  UpdateStorageLocationDto,
  ListStorageLocationsDto,
  StorageLocationResponseDto,
} from "@/types/dto/storage-location";
import { toStorageLocationResponseDto } from "@/lib/converters/storage-location";

export class StorageLocationBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * List storage locations, optionally building a tree structure if requested?
   * For now, returns a flat list or filtered list.
   * Tree construction is usually better handled in frontend or separate util, 
   * but if we want to return a tree, we'd need a recursive CTE or post-processing.
   * Sticking to flat list for API efficiency for now, or simple filtering.
   */
  async listStorageLocations(
    params: ListStorageLocationsDto = {}
  ): Promise<StorageLocationResponseDto[]> {
    const { organizationId, parentId, search } = params;

    let query = this.supabase
      .from("storage_locations")
      .select("*")
      .order("created_at", { ascending: true }); // Order by creation for stability

    if (organizationId) {
      query = query.eq("organization_id", organizationId);
    }

    if (parentId !== undefined) {
      if (parentId === null) {
        query = query.is("parent_id", null);
      } else {
        query = query.eq("parent_id", parentId);
      }
    }

    if (search?.trim()) {
      query = query.ilike("name", `%${search.trim()}%`);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message || "Error while fetching storage locations");
    }

    return (data as StorageLocationEntity[]).map(toStorageLocationResponseDto);
  }

  async getStorageLocationById(
    id: string
  ): Promise<StorageLocationResponseDto | null> {
    const { data, error } = await this.supabase
      .from("storage_locations")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        return null;
      }
      throw new Error(error.message || "Error while fetching storage location");
    }

    return toStorageLocationResponseDto(data as StorageLocationEntity);
  }

  async createStorageLocation(
    dto: CreateStorageLocationDto
  ): Promise<StorageLocationResponseDto> {
    const payload = {
      name: dto.name,
      organization_id: dto.organizationId,
      parent_id: dto.parentId ?? null,
      description: dto.description ?? null,
      active: dto.active ?? true,
    };

    const { data, error } = await this.supabase
      .from("storage_locations")
      .insert(payload)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error while creating storage location");
    }

    return toStorageLocationResponseDto(data as StorageLocationEntity);
  }

  async updateStorageLocation(
    id: string,
    dto: UpdateStorageLocationDto
  ): Promise<StorageLocationResponseDto> {
    const payload: Partial<StorageLocationEntity> = {};

    if (dto.name !== undefined) payload.name = dto.name;
    if (dto.parentId !== undefined) payload.parent_id = dto.parentId;
    if (dto.description !== undefined) payload.description = dto.description;
    if (dto.active !== undefined) payload.active = dto.active;

    const { data, error } = await this.supabase
      .from("storage_locations")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(error.message || "Error while updating storage location");
    }

    return toStorageLocationResponseDto(data as StorageLocationEntity);
  }

  async deleteStorageLocation(id: string): Promise<void> {
    // Check for children first?
    // FK constraint is simple, but Logic might forbid deleting parents with children.
    // For now, let database throw FK error if restrict, or we configured cascade?
    // The migration used ON DELETE CASCADE for Organization, but for parent_id? 
    // Usually we just say "REFERENCES public.storage_locations(id)" -> default is NO ACTION / RESTRICT.
    // So if there are children, this should fail, which is good.
    
    const { error } = await this.supabase
      .from("storage_locations")
      .delete()
      .eq("id", id);

    if (error) {
      throw new Error(error.message || "Error while deleting storage location");
    }
  }
}
