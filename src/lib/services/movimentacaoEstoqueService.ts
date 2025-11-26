/**
 * Serviço modular e reutilizável para movimentações de estoque
 * Pode ser usado em diferentes partes do sistema (dialogs, modais, rotas, etc)
 */

import { fetchWithAuth } from "@/lib/fetchWithAuth";
import {
  StockMovement,
  Stock,
  UnitOfMeasureCode,
  STOCK_MESSAGES,
} from "@/types/stock/stock";
import {
  QuickEntryResponseDto,
  ProductStockResponseDto,
  StockMovementResponseDto,
  StockResponseDto,
} from "@/types/dto/stock/response";
import { Product } from "@/types/stock/product";

export interface MovimentacaoEstoqueRequest {
  produto_id?: number;
  productId?: number;
  quantidade: number;
  observacao?: string;
}

export interface MovimentacaoEstoqueResponse {
  success: boolean;
  message: string;
  movimentacao?: StockMovement;
  estoque_atualizado?: Stock;
}

const toStockMovementFromDto = (
  dto?: StockMovementResponseDto
): StockMovement | undefined => {
  if (!dto) return undefined;

  return {
    ...dto,
    movement_type: dto.movementType,
    unit_of_measure_code: dto.unitOfMeasureCode,
    movement_date: dto.movementDate,
    created_at: dto.createdAt,
    product: toProductFromDto(dto.product),
  };
};

const toStockFromDto = (dto?: StockResponseDto): Stock | undefined => {
  if (!dto) return undefined;

  return {
    ...dto,
    current_quantity: dto.currentQuantity,
    unit_of_measure_code: dto.unitOfMeasureCode,
    created_at: dto.createdAt,
    updated_at: dto.updatedAt,
    product: toProductFromDto(dto.product),
  };
};

const toProductFromDto = (
  product?: ProductStockResponseDto
): Product | undefined =>
  product
    ? {
        id: product.id,
        name: product.name,
        group_id: product.groupId ?? null,
      }
    : undefined;

/**
 * Tipos de movimentação suportadas
 */
export type TipoMovimentacaoEstoque = "entrada" | "saida";

/**
 * Interface para produto com informações de estoque
 * Usado na listagem de produtos para movimentação
 */
export interface ProdutoComEstoque {
  id: number;
  name: string;
  group_id?: number | null;
  group?: {
    id: number;
    name: string;
    description?: string | null;
  } | null;
  estoque_atual?: number;
  current_quantity?: number;
  current_stock?: number;
  unit_of_measure_code: UnitOfMeasureCode;
}

/**
 * Classe para operações de estoque
 * Centraliza toda lógica de comunicação com API de estoque
 */
export class MovimentacaoEstoqueService {
  /**
   * Registra uma entrada rápida de estoque
   * @param request Dados da entrada (produto_id, quantidade, observacao)
   * @returns Promise com resultado da operação
   */
  static async registrarEntrada(
    request: MovimentacaoEstoqueRequest
  ): Promise<MovimentacaoEstoqueResponse> {
    try {
      const payload = {
        productId: request.productId ?? request.produto_id,
        quantity: request.quantidade,
        observation: request.observacao,
      };

      const response = await fetchWithAuth("/api/estoque/entrada-rapida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Erro ao registrar entrada"
        );
      }

      if (result?.data) {
        const payload = result.data as QuickEntryResponseDto;
        return {
          success: true,
          message:
            payload.message ||
            result.message ||
            STOCK_MESSAGES.ENTRY_SUCCESS,
          movimentacao: toStockMovementFromDto(payload.movement),
          estoque_atualizado: toStockFromDto(payload.updatedStock),
        };
      }

      return {
        success: result.success ?? true,
        message: result.message || STOCK_MESSAGES.ENTRY_SUCCESS,
        movimentacao: result.movimentacao,
        estoque_atualizado: result.estoque_atualizado,
      };
    } catch (error) {
      console.error("Erro ao registrar entrada:", error);
      throw error;
    }
  }

  /**
   * Registra uma saída rápida de estoque
   * @param request Dados da saída (produto_id, quantidade, observacao)
   * @returns Promise com resultado da operação
   */
  static async registrarSaida(
    request: MovimentacaoEstoqueRequest
  ): Promise<MovimentacaoEstoqueResponse> {
    try {
      const payload = {
        productId: request.productId ?? request.produto_id,
        quantity: request.quantidade,
        observation: request.observacao,
      };

      const response = await fetchWithAuth("/api/estoque/saida-rapida", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result.error || result.message || "Erro ao registrar saída"
        );
      }

      if (result?.data) {
        const payload = result.data as QuickEntryResponseDto;
        return {
          success: true,
          message:
            payload.message ||
            result.message ||
            STOCK_MESSAGES.EXIT_SUCCESS,
          movimentacao: toStockMovementFromDto(payload.movement),
          estoque_atualizado: toStockFromDto(payload.updatedStock),
        };
      }

      return {
        success: result.success ?? true,
        message: result.message || STOCK_MESSAGES.EXIT_SUCCESS,
        movimentacao: result.movimentacao,
        estoque_atualizado: result.estoque_atualizado,
      };
    } catch (error) {
      console.error("Erro ao registrar saída:", error);
      throw error;
    }
  }

  /**
   * Registra uma movimentação genérica (entrada ou saída)
   * @param tipo Tipo de movimentação ('entrada' ou 'saida')
   * @param request Dados da movimentação
   * @returns Promise com resultado da operação
   */
  static async registrarMovimentacao(
    tipo: TipoMovimentacaoEstoque,
    request: MovimentacaoEstoqueRequest
  ): Promise<MovimentacaoEstoqueResponse> {
    if (tipo === "entrada") {
      return this.registrarEntrada(request);
    } else {
      return this.registrarSaida(request);
    }
  }

  /**
   * Lista produtos disponíveis para seleção
   * @param termo Termo de busca (opcional)
   * @param limit Limite de resultados
   * @param apenasComEstoque Se true, filtra apenas produtos com estoque > 0
   * @returns Promise com lista de produtos
   */
  static async listarProdutos(
    termo = "",
    limit = 50,
    apenasComEstoque = false
  ): Promise<ProdutoComEstoque[]> {
    try {
      const params = new URLSearchParams();
      if (termo) params.append("q", termo);
      params.append("limit", limit.toString());

      const response = await fetchWithAuth(`/api/estoque/produtos?${params}`);
      const data = await response.json();

      if (response.ok) {
        const payload: ProdutoComEstoque[] =
          (data?.data as ProdutoComEstoque[]) ||
          (Array.isArray(data) ? data : []);
        let produtos = payload;

        // Filtrar apenas produtos com estoque > 0 se solicitado
        if (apenasComEstoque) {
          produtos = produtos.filter((p) => {
            const estoqueAtual =
              p.estoque_atual || p.current_quantity || p.current_stock || 0;
            return estoqueAtual > 0;
          });
        }

        return produtos;
      }
      throw new Error(
        data.error || data.details || "Erro ao carregar produtos"
      );
    } catch (error) {
      console.error("Erro ao listar produtos:", error);
      throw error;
    }
  }

  /**
   * Valida a quantidade para uma movimentação
   * @param quantidade Quantidade a validar
   * @param quantidadeDisponivel Quantidade disponível em estoque (para saída)
   * @returns Objeto com validação e mensagem de erro
   */
  static validarQuantidade(
    quantidade: number,
    quantidadeDisponivel?: number
  ): { valida: boolean; erro?: string } {
    if (!quantidade || isNaN(quantidade)) {
      return { valida: false, erro: "Quantidade é obrigatória" };
    }

    if (quantidade <= 0) {
      return { valida: false, erro: "Quantidade deve ser maior que zero" };
    }

    if (
      quantidadeDisponivel !== undefined &&
      quantidade > quantidadeDisponivel
    ) {
      return {
        valida: false,
        erro: `Quantidade insuficiente. Disponível: ${quantidadeDisponivel}`,
      };
    }

    return { valida: true };
  }
}
