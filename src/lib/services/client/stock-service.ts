import { api } from "@/lib/apiClient";
import { ApiResponse } from "@/types/common";
import {
  EstoqueListResponse,
  MovimentacoesListResponse,
  EstoqueFiltros,
  MovimentacoesFiltros,
} from "@/types/estoque";
import { StockStatistics } from "@/types/stock/stock";

interface ListStockParams extends Partial<EstoqueFiltros> {
  page?: number;
  pageSize?: number;
}

interface ListMovementsParams extends Partial<MovimentacoesFiltros> {
  page?: number;
  pageSize?: number;
}

export const StockService = {
  async listStock(params: ListStockParams = {}): Promise<EstoqueListResponse> {
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

    return data.data;
  },

  async listMovements(
    params: ListMovementsParams = {}
  ): Promise<MovimentacoesListResponse> {
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

    return data.data;
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
};
