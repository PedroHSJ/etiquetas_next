import { api } from "@/lib/apiClient";
import { Product, ProductGroup } from "@/types/models/product";

const API_URL = "/products";

export class ProductService {
  static async getProducts(organizationId: string): Promise<Product[]> {
    const response = await api.get<any[]>(API_URL, {
      params: { organizationId },
    });

    return response.data.map((p: any) => ({
      id: p.id,
      name: p.name,
      groupId: p.groupId || p.group_id || null,
      organizationId: p.organizationId || p.organization_id || null,
      isActive: p.isActive !== undefined ? p.isActive : p.is_active,
      createdAt: new Date(p.createdAt || p.created_at),
      updatedAt: new Date(p.updatedAt || p.updated_at),
    })) as Product[];
  }

  static async getGroups(organizationId: string): Promise<ProductGroup[]> {
    const response = await api.get<any[]>(`${API_URL}/groups`, {
      params: { organizationId },
    });

    return response.data.map((g: any) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      organizationId: g.organizationId || g.organization_id || null,
      isActive: g.isActive !== undefined ? g.isActive : g.is_active,
    })) as ProductGroup[];
  }
}
