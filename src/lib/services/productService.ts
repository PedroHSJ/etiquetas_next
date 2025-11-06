import { supabase } from "@/lib/supabaseClient";
import { Product, ProductGroup } from "@/types/stock/product";

export class ProductService {
  // Produtos
  static async getProducts(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  static async getProduct(id: number): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createProduct(
    product: Omit<Product, "id" | "group">
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select(
        `
        *,
        group:groups(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProduct(
    id: number,
    updates: Partial<Product>
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        group:groups(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProduct(id: number): Promise<void> {
    const { error } = await supabase
      .from("products")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }

  static async searchProducts(
    organizationId: string,
    query: string
  ): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .ilike("name", `%${query}%`)
      .order("name")
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // Grupos de Produtos
  static async getGroups(organizationId: string): Promise<ProductGroup[]> {
    const { data, error } = await supabase
      .from("groups")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  static async createGroup(
    group: Omit<ProductGroup, "id">
  ): Promise<ProductGroup> {
    const { data, error } = await supabase
      .from("groups")
      .insert(group)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateGroup(
    id: number,
    updates: Partial<ProductGroup>
  ): Promise<ProductGroup> {
    const { data, error } = await supabase
      .from("groups")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteGroup(id: number): Promise<void> {
    const { error } = await supabase
      .from("groups")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }

  // Estatísticas
  static async getProductStats(organizationId: string) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, group_id")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    const { data: groups, error: groupsError } = await supabase
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
            (p: { group_id: number | null }) => p.group_id === group.id
          ).length || 0,
      })) || [];

    return {
      totalProducts,
      totalGroups,
      productsByGroup,
    };
  }
}
