import { api } from "@/lib/apiClient";
import { ApiResponse, ApiSuccessResponse } from "@/types/common";
import {
  EstoqueListResponse,
  MovimentacoesListResponse,
  EstoqueFiltros,
  MovimentacoesFiltros,
} from "@/types/estoque";
import {
  StockStatistics,
  ProductSelect,
  QuickEntryRequest,
  STOCK_MESSAGES,
} from "@/types/stock/stock";
import { QuickEntryResponseDto } from "@/types/dto/stock/response";
import {
  StockListModelResponse,
  MovementListModelResponse,
} from "@/types/models/stock";
import { toStockModel, toStockMovementModel } from "@/lib/converters/stock";

interface ListStockParams extends Partial<EstoqueFiltros> {
  page?: number;
  pageSize?: number;
}

interface ListMovementsParams extends Partial<MovimentacoesFiltros> {
  page?: number;
  pageSize?: number;
}

interface ListProductsParams {
  q?: string;
  limit?: number;
}

export const StockService = {
  async listStock(
    params: ListStockParams = {}
  ): Promise<StockListModelResponse> {
    const { page = 1, pageSize = 20, ...filters } = params;

    const { data } = await api.get<ApiResponse<EstoqueListResponse>>(
      "/estoque",
      {
        params: {
          page,
          pageSize,
          ...filters,
        },
      }
    );

    if (!data?.data) {
      throw new Error("Erro ao carregar estoque");
    }

    return {
      ...data.data,
      data: (data.data.data || []).map(toStockModel),
    };
  },

  async listMovements(
    params: ListMovementsParams = {}
  ): Promise<MovementListModelResponse> {
    const { page = 1, pageSize = 20, ...filters } = params;

    const { data } = await api.get<ApiResponse<MovimentacoesListResponse>>(
      "/estoque/movimentacoes",
      {
        params: {
          page,
          pageSize,
          ...filters,
        },
      }
    );

    if (!data?.data) {
      throw new Error("Erro ao carregar movimentações");
    }

    return {
      ...data.data,
      data: (data.data.data || []).map(toStockMovementModel),
    };
  },

  async getStockStatistics(): Promise<StockStatistics> {
    const { data } = await api.get<ApiResponse<StockStatistics>>(
      "/estoque/stats"
    );

    if (!data?.data) {
      throw new Error("Erro ao carregar estatísticas do estoque");
    }

    return data.data;
  },

  async listProducts(
    params: ListProductsParams = {}
  ): Promise<ProductSelect[]> {
    const { data } = await api.get<ApiResponse<ProductSelect[]>>(
      "/estoque/produtos",
      {
        params,
      }
    );

    if (!data?.data) {
      throw new Error("Erro ao carregar produtos");
    }

    return data.data;
  },

  async quickEntry(
    request: QuickEntryRequest
  ): Promise<QuickEntryResponseDto> {
    const { data } = await api.post<
      ApiSuccessResponse<QuickEntryResponseDto>
    >(
      "/estoque/entrada-rapida",
      request
    );

    if (!data?.data) {
      throw new Error("Erro ao processar entrada rápida");
    }

    return {
      ...data.data,
      message: data.data.message || data.message || STOCK_MESSAGES.ENTRY_SUCCESS,
    };
  },
};
