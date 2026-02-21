import { api } from "@/lib/apiClient";
import { ApiResponse, ApiSuccessResponse } from "@/types/common";
import {
  QuickEntryResponseDto,
  StockResponseDto,
  StockMovementResponseDto,
  ProductStockResponseDto,
} from "@/types/dto/stock/response";
import {
  QuickEntryRequest,
  STOCK_MESSAGES,
  UnitOfMeasureCode,
} from "@/types/stock/stock";

interface ListProductsParams {
  q?: string;
  limit?: number;
  organizationId?: string;
  onlyWithStock?: boolean;
}

export interface QuickMovementResult {
  success: boolean;
  message: string;
  movement?: StockMovementResponseDto;
  updatedStock?: StockResponseDto;
}

const toMovementResult = (
  payload: QuickEntryResponseDto,
  fallbackMessage: string,
): QuickMovementResult => {
  return {
    success: true,
    message: payload.message || fallbackMessage,
    movement: payload.movement,
    updatedStock: payload.updatedStock,
  };
};

export const StockMovementService = {
  async quickEntry(params: QuickEntryRequest): Promise<QuickMovementResult> {
    if (!params.organizationId) {
      throw new Error("organizationId é obrigatório");
    }

    const { data } = await api.post<ApiSuccessResponse<QuickEntryResponseDto>>(
      "/estoque/entrada-rapida",
      {
        ...params,
      },
    );

    if (!data?.data) {
      throw new Error("Erro ao processar entrada rápida");
    }

    return toMovementResult(
      data.data,
      data.message || STOCK_MESSAGES.ENTRY_SUCCESS,
    );
  },

  async quickExit(params: QuickEntryRequest): Promise<QuickMovementResult> {
    if (!params.organizationId) {
      throw new Error("organizationId é obrigatório");
    }

    const { data } = await api.post<ApiSuccessResponse<QuickEntryResponseDto>>(
      "/estoque/saida-rapida",
      {
        ...params,
      },
    );

    if (!data?.data) {
      throw new Error("Erro ao processar saída rápida");
    }

    return toMovementResult(
      data.data,
      data.message || STOCK_MESSAGES.EXIT_SUCCESS,
    );
  },

  async listProducts(
    params: ListProductsParams = {},
  ): Promise<ProductStockResponseDto[]> {
    const { data } = await api.get<ApiResponse<ProductStockResponseDto[]>>(
      "/estoque/produtos",
      {
        params,
      },
    );

    return data?.data ?? [];
  },

  validateQuantity(
    quantity: number,
    availableQuantity?: number,
  ): { valid: boolean; error?: string } {
    if (!quantity || Number.isNaN(quantity)) {
      return { valid: false, error: "Quantidade é obrigatória" };
    }

    if (quantity <= 0) {
      return { valid: false, error: "Quantidade deve ser maior que zero" };
    }

    if (availableQuantity !== undefined && quantity > availableQuantity) {
      return {
        valid: false,
        error: `Quantidade insuficiente. Disponível: ${availableQuantity}`,
      };
    }

    return { valid: true };
  },
};
