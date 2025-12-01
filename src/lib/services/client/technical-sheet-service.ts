import { api } from "@/lib/apiClient";
import { ApiResponse, ApiSuccessResponse } from "@/types/common/api";
import {
  CreateTechnicalSheetDto,
  UpdateTechnicalSheetDto,
} from "@/types/dto/technical-sheet/request";
import {
  TechnicalSheetListResponseDto,
  TechnicalSheetResponseDto,
} from "@/types/dto/technical-sheet/response";
import {
  EditableIngredient,
  IngredientSuggestion,
  TechnicalSheetAIRequest,
  TechnicalSheetAIResponse,
  TechnicalSheetListModel,
  TechnicalSheetModel,
} from "@/types/models/technical-sheet";
import { toTechnicalSheetModel } from "@/lib/converters/technical-sheet";
import { StockService } from "./stock-service";
import { ProductSelect } from "@/types/stock/stock";

interface ListParams {
  organizationId: string;
  page?: number;
  pageSize?: number;
  difficulty?: string;
  active?: boolean;
}

export const TechnicalSheetService = {
  async list({
    organizationId,
    page = 1,
    pageSize = 12,
    difficulty,
    active = true,
  }: ListParams): Promise<TechnicalSheetListModel> {
    const { data } = await api.get<
      ApiResponse<TechnicalSheetListResponseDto>
    >("/technical-sheets", {
      params: { organizationId, page, pageSize, difficulty, active },
    });

    if (!data?.data) {
      throw new Error("Erro ao carregar fichas técnicas");
    }

    const mapped = {
      ...data.data,
      data: data.data.data.map(toTechnicalSheetModel),
    };

    mapped.data = mapped.data.filter((sheet) => sheet.active !== false);

    return mapped;
  },

  async getById(
    id: string,
    organizationId: string
  ): Promise<TechnicalSheetModel> {
    const { data } = await api.get<
      ApiResponse<TechnicalSheetResponseDto>
    >(`/technical-sheets/${id}`, {
      params: { organizationId },
    });

    if (!data?.data) {
      throw new Error("Ficha técnica não encontrada");
    }

    return toTechnicalSheetModel(data.data);
  },

  async create(
    payload: CreateTechnicalSheetDto
  ): Promise<TechnicalSheetModel> {
    const { data } = await api.post<
      ApiSuccessResponse<TechnicalSheetResponseDto>
    >("/technical-sheets", payload);

    if (!data?.data) {
      throw new Error("Erro ao criar ficha técnica");
    }

    return toTechnicalSheetModel(data.data);
  },

  async update(
    id: string,
    payload: UpdateTechnicalSheetDto
  ): Promise<TechnicalSheetModel> {
    const { data } = await api.put<
      ApiSuccessResponse<TechnicalSheetResponseDto>
    >(`/technical-sheets/${id}`, payload);

    if (!data?.data) {
      throw new Error("Erro ao atualizar ficha técnica");
    }

    return toTechnicalSheetModel(data.data);
  },

  async remove(id: string, organizationId: string): Promise<void> {
    await this.update(id, { organizationId, active: false });
  },

  async generateIngredientSuggestions(
    request: TechnicalSheetAIRequest
  ): Promise<TechnicalSheetAIResponse> {
    const { data } = await api.post<TechnicalSheetAIResponse>(
      "/technical-sheet/generate",
      request
    );

    if (!data) {
      throw new Error("Erro ao gerar ficha técnica");
    }

    return data;
  },

  async matchIngredientsWithProducts(
    ingredients: IngredientSuggestion[],
    organizationId: string
  ): Promise<EditableIngredient[]> {
    const editable: EditableIngredient[] = [];

    for (const ingredient of ingredients) {
      try {
        const products = await StockService.listProducts({
          q: ingredient.name,
          limit: 5,
          organizationId,
        });

        const first = (products as ProductSelect[])[0];

        editable.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          originalQuantity: ingredient.quantity,
          productId: first ? String(first.id) : undefined,
          isEditing: false,
        });
      } catch (error) {
        console.error(
          `Erro ao buscar produto para ${ingredient.name}:`,
          error
        );
        editable.push({
          id: `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          originalQuantity: ingredient.quantity,
          isEditing: false,
        });
      }
    }

    return editable;
  },

  async searchAvailableProducts(
    organizationId: string,
    query: string
  ): Promise<ProductSelect[]> {
    try {
      return await StockService.listProducts({
        q: query,
        organizationId,
        limit: 20,
      });
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
      return [];
    }
  },

  calculateProportionalQuantities(
    ingredients: EditableIngredient[],
    originalServings: number,
    newServings: number
  ): EditableIngredient[] {
    const ratio = newServings / originalServings;

    return ingredients.map((ingredient) => {
      const numericQuantity = parseFloat(ingredient.originalQuantity);
      const newQuantity = Number.isNaN(numericQuantity)
        ? ingredient.originalQuantity
        : (numericQuantity * ratio).toFixed(2);

      return {
        ...ingredient,
        quantity: newQuantity,
      };
    });
  },

  isValidQuantity(quantity: string): boolean {
    const numericValue = parseFloat(quantity);
    return !Number.isNaN(numericValue) && numericValue > 0;
  },

  formatQuantity(quantity: string, unit: string): string {
    const numericValue = parseFloat(quantity);
    if (Number.isNaN(numericValue)) return `${quantity} ${unit}`;

    const formattedValue =
      numericValue % 1 === 0
        ? numericValue.toString()
        : numericValue.toFixed(2).replace(/\.?0+$/, "");

    return `${formattedValue} ${unit}`;
  },
};
