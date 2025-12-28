import { api } from "@/lib/apiClient";
import { ApiResponse, ApiSuccessResponse } from "@/types/common";
import {
  QuickEntryResponseDto,
  ProductStockResponseDto,
} from "@/types/dto/stock/response";
import {
  toProductStockModel,
  toProductStockResponseDto,
  toStockModel,
  toStockMovementModel,
} from "@/lib/converters/stock";
import {
  ProductStockModel,
  StockMovementModel,
  StockModel,
} from "@/types/models/stock";
import {
  QuickEntryRequest,
  STOCK_MESSAGES,
  UnitOfMeasureCode,
} from "@/types/stock/stock";

type ProductWithStockApiPayload = {
  id: number;
  name: string;
  group_id?: number | null;
  group?: { id: number; name: string; description?: string | null } | null;
  unit_of_measure_code?: UnitOfMeasureCode | null;
  current_quantity?: number | null;
  current_stock?: number | null;
  estoque_atual?: number | null;
};

interface ListProductsParams {
  q?: string;
  limit?: number;
  organizationId?: string;
  onlyWithStock?: boolean;
}

export interface QuickMovementResult {
  success: boolean;
  message: string;
  movement?: StockMovementModel;
  updatedStock?: StockModel;
}

const toMovementResult = (
  payload: QuickEntryResponseDto,
  fallbackMessage: string
): QuickMovementResult => {
  const movementModel = payload.movement
    ? toStockMovementModel(payload.movement)
    : undefined;
  const updatedStockModel = payload.updatedStock
    ? toStockModel(payload.updatedStock)
    : undefined;

  return {
    success: true,
    message: payload.message || fallbackMessage,
    movement: movementModel,
    updatedStock: updatedStockModel,
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
      }
    );

    if (!data?.data) {
      throw new Error("Erro ao processar entrada rápida");
    }

    return toMovementResult(
      data.data,
      data.message || STOCK_MESSAGES.ENTRY_SUCCESS
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
      }
    );

    if (!data?.data) {
      throw new Error("Erro ao processar saída rápida");
    }

    return toMovementResult(
      data.data,
      data.message || STOCK_MESSAGES.EXIT_SUCCESS
    );
  },

  async listProducts(
    params: ListProductsParams = {}
  ): Promise<ProductStockModel[]> {
    const { onlyWithStock, ...query } = params;

    const { data } = await api.get<ApiResponse<ProductWithStockApiPayload[]>>(
      "/estoque/produtos",
      {
        params,
      }
    );

    const items = data?.data ?? [];

    const products = items
      .map((product) => toProductStockResponseDto(product))
      .filter(Boolean)
      .map((dto) => toProductStockModel(dto as ProductStockResponseDto))
      .filter(Boolean) as ProductStockModel[];

    // if (onlyWithStock) {
    //   return products.filter(
    //     (product) => (product.currentQuantity ?? 0) > 0
    //   );
    // }

    return products;
  },

  validateQuantity(
    quantity: number,
    availableQuantity?: number
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
