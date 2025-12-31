import { api } from "@/lib/apiClient";
import { ApiResponse, ApiSuccessResponse } from "@/types/common";
import { EstoqueFiltros, MovimentacoesFiltros } from "@/types/estoque";
import {
  StockStatistics,
  ProductSelect,
  QuickEntryRequest,
  STOCK_MESSAGES,
} from "@/types/stock/stock";
import {
  QuickEntryResponseDto,
  StockListResponseDto,
  MovementListResponseDto,
} from "@/types/dto/stock/response";
import {
  StockListModelResponse,
  MovementListModelResponse,
} from "@/types/models/stock";
import { toStockModel, toStockMovementModel } from "@/lib/converters/stock";

interface ListStockParams extends Partial<EstoqueFiltros> {
  page?: number;
  pageSize?: number;
  organizationId: string;
}

interface ListMovementsParams extends Partial<MovimentacoesFiltros> {
  page?: number;
  pageSize?: number;
  organizationId: string;
}

interface ListProductsParams {
  q?: string;
  limit?: number;
  organizationId?: string;
}

export const StockService = {
  async listStock(params: ListStockParams): Promise<StockListModelResponse> {
    const { page = 1, pageSize = 20, organizationId, ...filters } = params;

    if (!organizationId) {
      throw new Error("organizationId é obrigatório");
    }

    const { data } = await api.get<ApiResponse<StockListResponseDto>>(
      "/estoque",
      {
        params: {
          page,
          pageSize,
          organizationId,
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
    params: ListMovementsParams
  ): Promise<MovementListModelResponse> {
    const { page = 1, pageSize = 20, organizationId, ...filters } = params;

    if (!organizationId) {
      throw new Error("organizationId é obrigatório");
    }

    const { data } = await api.get<ApiResponse<MovementListResponseDto>>(
      "/estoque/movimentacoes",
      {
        params: {
          page,
          pageSize,
          organizationId,
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

  async getStockStatistics(organizationId: string): Promise<StockStatistics> {
    if (!organizationId) {
      throw new Error("organizationId é obrigatório");
    }
    const { data } = await api.get<ApiResponse<StockStatistics>>(
      "/estoque/stats",
      {
        params: { organizationId },
      }
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

  async quickEntry(request: QuickEntryRequest): Promise<QuickEntryResponseDto> {
    if (!request.organizationId) {
      throw new Error("organizationId é obrigatório");
    }

    const { data } = await api.post<ApiSuccessResponse<QuickEntryResponseDto>>(
      "/estoque/entrada-rapida",
      request
    );

    if (!data?.data) {
      throw new Error("Erro ao processar entrada rápida");
    }

    return {
      ...data.data,
      message:
        data.data.message || data.message || STOCK_MESSAGES.ENTRY_SUCCESS,
    };
  },
};
