import { api } from "@/lib/apiClient";
import {
  CreateStockInTransitDto,
  UpdateStockInTransitDto,
} from "@/types/dto/stock-in-transit/request";
import {
  StockInTransitResponseDto,
  StockInTransitListResponseDto,
} from "@/types/dto/stock-in-transit/response";

const API_URL = "/stock-in-transit";

export class StockInTransitService {
  static async list(params: {
    page: number;
    pageSize: number;
    organizationId: string;
  }): Promise<{ data: StockInTransitResponseDto[]; total: number }> {
    const response = await api.get<StockInTransitListResponseDto>(API_URL, {
      params,
    });

    return {
      data: response.data.data || [],
      total: response.data.total,
    };
  }

  static async create(
    dto: CreateStockInTransitDto,
  ): Promise<StockInTransitResponseDto> {
    const response = await api.post<{ data: StockInTransitResponseDto }>(
      API_URL,
      dto,
    );
    return response.data.data;
  }

  static async update(
    id: string,
    dto: UpdateStockInTransitDto,
  ): Promise<StockInTransitResponseDto> {
    const response = await api.put<{ data: StockInTransitResponseDto }>(
      `${API_URL}/${id}`,
      dto,
    );
    return response.data.data;
  }

  static async delete(id: string): Promise<void> {
    await api.delete(`${API_URL}/${id}`);
  }
}
