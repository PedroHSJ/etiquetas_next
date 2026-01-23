import type { SupabaseClient } from "@supabase/supabase-js";
import { ProductEntity } from "@/types/database/product";
import { GroupEntity } from "@/types/database/group";
import {
  ProductResponseDto,
  ProductGroupResponseDto,
} from "@/types/dto/product/response";
import {
  CreateProductDto,
  UpdateProductDto,
  CreateProductGroupDto,
  UpdateProductGroupDto,
} from "@/types/dto/product/request";
import {
  toProductResponseDto,
  toProductGroupResponseDto,
  toProductEntityForCreate,
  toProductEntityForUpdate,
  toGroupEntityForCreate,
  toGroupEntityForUpdate,
} from "@/lib/converters/product";

export class ProductBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  async getProducts(): Promise<ProductResponseDto[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `,
      )
      .order("name");

    if (error) throw error;

    const products = data as unknown as (ProductEntity & {
      group: GroupEntity | null;
    })[];

    return products.map((p) => toProductResponseDto(p, p.group));
  }

  async getProduct(id: number): Promise<ProductResponseDto | null> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    if (!data) return null;

    const product = data as unknown as ProductEntity & {
      group: GroupEntity | null;
    };
    return toProductResponseDto(product, product.group);
  }

  async createProduct(dto: CreateProductDto): Promise<ProductResponseDto> {
    const payload = toProductEntityForCreate(dto);

    const { data, error } = await this.supabase
      .from("products")
      .insert(payload)
      .select(
        `
        *,
        group:groups(*)
      `,
      )
      .single();

    if (error) throw error;

    const created = data as unknown as ProductEntity & {
      group: GroupEntity | null;
    };
    return toProductResponseDto(created, created.group);
  }

  async updateProduct(
    id: number,
    dto: UpdateProductDto,
  ): Promise<ProductResponseDto> {
    const payload = toProductEntityForUpdate(dto);

    const { data, error } = await this.supabase
      .from("products")
      .update(payload)
      .eq("id", id)
      .select(
        `
        *,
        group:groups(*)
      `,
      )
      .single();

    if (error) throw error;

    const updated = data as unknown as ProductEntity & {
      group: GroupEntity | null;
    };
    return toProductResponseDto(updated, updated.group);
  }

  async deleteProduct(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  }

  async searchProducts(
    organizationId: string,
    query: string,
  ): Promise<ProductResponseDto[]> {
    const { data, error } = await this.supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `,
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(20);

    if (error) throw error;

    const products = data as unknown as (ProductEntity & {
      group: GroupEntity | null;
    })[];
    return products.map((p) => toProductResponseDto(p, p.group));
  }

  // Product Groups
  async getGroups(organizationId: string): Promise<ProductGroupResponseDto[]> {
    const { data, error } = await this.supabase
      .from("groups")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;

    const groups = data as unknown as GroupEntity[];
    return groups.map(toProductGroupResponseDto);
  }

  async createGroup(
    dto: CreateProductGroupDto,
  ): Promise<ProductGroupResponseDto> {
    const payload = toGroupEntityForCreate(dto);

    const { data, error } = await this.supabase
      .from("groups")
      .insert(payload)
      .select()
      .single();

    if (error) throw error;

    return toProductGroupResponseDto(data as GroupEntity);
  }

  async updateGroup(
    id: number,
    dto: UpdateProductGroupDto,
  ): Promise<ProductGroupResponseDto> {
    const payload = toGroupEntityForUpdate(dto);

    const { data, error } = await this.supabase
      .from("groups")
      .update(payload)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;

    return toProductGroupResponseDto(data as GroupEntity);
  }

  async deleteGroup(id: number): Promise<void> {
    const { error } = await this.supabase
      .from("groups")
      .update({ is_active: false })
      .eq("id", id);
    if (error) throw error;
  }

  // Statistics
  async getProductStats(
    organizationId: string,
  ): Promise<import("@/types/dto/product/response").ProductStatsResponseDto> {
    const { data: products, error: productsError } = await this.supabase
      .from("products")
      .select("id, group_id")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    const { data: groups, error: groupsError } = await this.supabase
      .from("groups")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (productsError || groupsError) {
      throw productsError || groupsError;
    }

    const totalProducts = products?.length || 0;
    const totalGroups = groups?.length || 0;

    const productsByGroup =
      groups?.map((group: { id: number; name: string }) => ({
        group: group.name,
        count:
          products?.filter(
            (p: { group_id: number | null }) => p.group_id === group.id,
          ).length || 0,
      })) || [];

    return {
      totalProducts,
      totalGroups,
      productsByGroup,
    };
  }
}
