import { api } from "@/lib/apiClient";
import {
  ProductGroupResponseDto,
  ProductResponseDto,
} from "@/types/dto/product/response";

const API_URL = "/products";

export class ProductService {
  static async getProducts(
    organizationId: string,
  ): Promise<ProductResponseDto[]> {
    const response = await api.get<ProductResponseDto[]>(API_URL, {
      params: { organizationId },
    });
    return response.data;
  }

  static async getGroups(
    organizationId: string,
  ): Promise<ProductGroupResponseDto[]> {
    const response = await api.get<ProductGroupResponseDto[]>(
      `${API_URL}/groups`,
      {
        params: { organizationId },
      },
    );

    return response.data;
  }
}
