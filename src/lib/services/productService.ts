import { supabase } from "@/lib/supabaseClient";
import { Product, ProductCategory } from "@/types/products";

export class ProductService {
  // Produtos
  static async getProducts(organizationId: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:product_categories(*)
      `
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  static async getProduct(id: string): Promise<Product | null> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:product_categories(*)
      `
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return data;
  }

  static async createProduct(
    product: Omit<Product, "id" | "created_at" | "updated_at">
  ): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .insert(product)
      .select(
        `
        *,
        category:product_categories(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async updateProduct(id: string, updates: Partial<Product>): Promise<Product> {
    const { data, error } = await supabase
      .from("products")
      .update(updates)
      .eq("id", id)
      .select(
        `
        *,
        category:product_categories(*)
      `
      )
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteProduct(id: string): Promise<void> {
    const { error } = await supabase.from("products").update({ is_active: false }).eq("id", id);

    if (error) throw error;
  }

  static async searchProducts(organizationId: string, query: string): Promise<Product[]> {
    const { data, error } = await supabase
      .from("products")
      .select(
        `
        *,
        category:product_categories(*)
      `
      )
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .or(`name.ilike.%${query}%,description.ilike.%${query}%,brand.ilike.%${query}%`)
      .order("name")
      .limit(20);

    if (error) throw error;
    return data || [];
  }

  // Categorias
  static async getCategories(organizationId: string): Promise<ProductCategory[]> {
    const { data, error } = await supabase
      .from("product_categories")
      .select("*")
      .eq("organization_id", organizationId)
      .eq("is_active", true)
      .order("name");

    if (error) throw error;
    return data || [];
  }

  static async createCategory(
    category: Omit<ProductCategory, "id" | "created_at" | "updated_at">
  ): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from("product_categories")
      .insert(category)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async updateCategory(
    id: string,
    updates: Partial<ProductCategory>
  ): Promise<ProductCategory> {
    const { data, error } = await supabase
      .from("product_categories")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  static async deleteCategory(id: string): Promise<void> {
    const { error } = await supabase
      .from("product_categories")
      .update({ is_active: false })
      .eq("id", id);

    if (error) throw error;
  }

  // Estatísticas
  static async getProductStats(organizationId: string) {
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, category_id")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    const { data: categories, error: categoriesError } = await supabase
      .from("product_categories")
      .select("id, name")
      .eq("organization_id", organizationId)
      .eq("is_active", true);

    if (productsError || categoriesError) {
      throw productsError || categoriesError;
    }

    const totalProducts = products?.length || 0;
    const totalCategories = categories?.length || 0;

    const productsByCategory =
      categories?.map((category: { id: string; name: string }) => ({
        category: category.name,
        count:
          products?.filter((p: { category_id: string }) => p.category_id === category.id).length ||
          0,
      })) || [];

    return {
      totalProducts,
      totalCategories,
      productsByCategory,
    };
  }
}
