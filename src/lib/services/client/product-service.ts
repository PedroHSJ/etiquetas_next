import { api } from "@/lib/apiClient";
import { Product, ProductGroup } from "@/types/models/product";
import {
  ProductGroupResponseDto,
  ProductResponseDto,
} from "@/types/dto/product/response";

const API_URL = "/products";

export class ProductService {
  static async getProducts(organizationId: string): Promise<Product[]> {
    const response = await api.get<ProductResponseDto[]>(API_URL, {
      params: { organizationId },
    });
    console.table(response.data);
    return response.data.map((p) => ({
      id: p.id,
      name: p.name,
      groupId: p.groupId,
      organizationId: p.organizationId,
      isActive: p.isActive,
      createdAt: new Date(p.createdAt),
      updatedAt: new Date(p.updatedAt),
    })) as Product[];
  }

  static async getGroups(organizationId: string): Promise<ProductGroup[]> {
    const response = await api.get<ProductGroupResponseDto[]>(
      `${API_URL}/groups`,
      {
        params: { organizationId },
      },
    );

    return response.data.map((g) => ({
      id: g.id,
      name: g.name,
      description: g.description,
      organizationId: g.organizationId,
      isActive: g.isActive,
    })) as ProductGroup[];
  }
}
