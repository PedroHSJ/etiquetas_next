import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EstoqueListResponse,
  MovimentacoesListResponse,
  EstoqueFiltros,
  MovimentacoesFiltros,
} from "@/types/estoque";
import {
  Stock,
  StockMovement,
  StockStatistics,
  STOCK_MESSAGES,
  UnitOfMeasureCode,
} from "@/types/stock/stock";
import {
  QuickEntryResponseDto,
  StockMovementResponseDto,
  StockResponseDto,
} from "@/types/dto/stock/response";
import { StockEntity, StockMovementEntity } from "@/types/database/stock";
import {
  toStockMovementResponseDto,
  toStockResponseDto,
} from "@/lib/converters/stock";
import { UserWithName } from "@/types/dto/profile/response";

type ProductJoin = {
  id: number;
  name: string;
  group_id?: number | null;
  unit_of_measure_code?: UnitOfMeasureCode | null;
};

type MovementWithRelations = StockMovementEntity & {
  product?: ProductJoin | null;
  user?: {
    id: string;
    email?: string;
    name?: string;
    fullName?: string;
  };
};

interface ListStockParams {
  page: number;
  pageSize: number;
  filters?: EstoqueFiltros;
  organizationId: string;
}

interface ListMovementsParams {
  page: number;
  pageSize: number;
  filters?: MovimentacoesFiltros;
  organizationId: string;
}

/**
 * Backend service responsável por operações de estoque.
 * Implementa o padrão DTO + Services adotado pelo projeto.
 */
export class StockBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  /**
   * Lista itens de estoque com paginação e filtros opcionais.
   */
  async listStock({
    page,
    pageSize,
    filters,
    organizationId,
  }: ListStockParams): Promise<EstoqueListResponse> {
    const offset = (page - 1) * pageSize;

    let query = this.supabase
      .from("stock")
      .select(
        `
        *,
        product:products(*),
        storage_location:storage_locations(id, name, parent_id)
      `,
        { count: "exact" }
      )
      .eq("organization_id", organizationId)
      .order("updated_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (filters?.productId) {
      query = query.eq("productId", filters.productId);
    }

    if (filters?.userId) {
      query = query.eq("userId", filters.userId);
    }

    if (filters?.estoque_zerado) {
      query = query.eq("current_quantity", 0);
    } else if (filters?.estoque_baixo) {
      const minimum = filters.quantidade_minima ?? 10;
      query = query.gt("current_quantity", 0).lt("current_quantity", minimum);
    }

    if (filters?.produto_nome) {
      query = query.ilike("product.name", `%${filters.produto_nome}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message || "Error while fetching stock items");
    }

    return {
      data: (data ?? []) as Stock[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  /**
   * Lista movimentações de estoque com paginação e filtros.
   */
  async listMovements({
    page,
    pageSize,
    filters,
    organizationId,
  }: ListMovementsParams): Promise<MovimentacoesListResponse> {
    const offset = (page - 1) * pageSize;

    let query = this.supabase
      .from("stock_movements")
      .select(
        `
        *,
        product:products(*)
      `,
        { count: "exact" }
      )
      .eq("organization_id", organizationId)
      .order("movement_date", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (filters?.productId) {
      query = query.eq("productId", filters.productId);
    }

    if (filters?.userId) {
      query = query.eq("userId", filters.userId);
    }

    if (filters?.tipo_movimentacao) {
      query = query.eq("movement_type", filters.tipo_movimentacao);
    }

    if (filters?.data_inicio) {
      query = query.gte("movement_date", filters.data_inicio);
    }

    if (filters?.data_fim) {
      const endDate = new Date(filters.data_fim);
      endDate.setHours(23, 59, 59, 999);
      query = query.lte("movement_date", endDate.toISOString());
    }

    if (filters?.produto_nome) {
      query = query.ilike("product.name", `%${filters.produto_nome}%`);
    }

    const { data, error, count } = await query;

    if (error) {
      throw new Error(error.message || "Error while fetching stock movements");
    }

    const movements = (data ?? []) as MovementWithRelations[];

    // Enrich with user info
    const uniqueUserIds = Array.from(
      new Set(movements.map((movement) => movement.userId).filter(Boolean))
    );

    const usersMap = new Map<string, UserWithName>();

    if (uniqueUserIds.length > 0) {
      const { data: usersData, error: usersError } = await this.supabase.rpc(
        "get_multiple_users_data",
        { user_ids: uniqueUserIds }
      );

      if (usersError) {
        throw new Error(
          usersError.message || "Error while loading movement user data"
        );
      }

      (usersData as UserWithName[] | null)?.forEach((user) => {
        if (user?.id) {
          usersMap.set(user.id, user);
        }
      });
    }

    const enriched = movements.map((movement) => {
      const user = usersMap.get(movement.userId);
      const movementUser = user
        ? {
            id: user.id,
            email: user.email,
            name: user.name ?? user.full_name ?? undefined,
            fullName: user.full_name ?? user.name ?? undefined,
          }
        : undefined;

      const movementWithUser: MovementWithRelations = {
        ...movement,
        user: movementUser,
      };

      return toStockMovementResponseDto(movementWithUser);
    });

    return {
      data: enriched as unknown as StockMovement[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  /**
   * Calcula estatísticas básicas do estoque.
   */
  async getStatistics(organizationId: string): Promise<StockStatistics> {
    const { data, error } = await this.supabase
      .from("stock")
      .select("current_quantity")
      .eq("organization_id", organizationId);

    if (error) {
      throw new Error(
        error.message || "Error while calculating stock statistics"
      );
    }

    const rows = (data ?? []) as { current_quantity: number }[];
    const total = rows.length;
    const productsInStock = rows.filter(
      (item) => (item.current_quantity ?? 0) > 0
    ).length;
    const productsOutOfStock = rows.filter(
      (item) => (item.current_quantity ?? 0) === 0
    ).length;
    const productsLowStock = rows.filter(
      (item) => item.current_quantity > 0 && item.current_quantity < 10
    ).length;

    return {
      total_products: total,
      products_in_stock: productsInStock,
      products_out_of_stock: productsOutOfStock,
      products_low_stock: productsLowStock,
      last_update: new Date().toISOString(),
    };
  }

  /**
   * Registra uma entrada rápida de estoque e retorna DTOs normalizados
   */
  async registerQuickEntry(params: {
    productId: number;
    quantity: number;
    userId: string;
    organizationId: string;
    unitOfMeasureCode?: UnitOfMeasureCode;
    storageLocationId?: string;
    observation?: string;
  }): Promise<QuickEntryResponseDto> {
    const {
      productId,
      quantity,
      userId,
      organizationId,
      unitOfMeasureCode,
      storageLocationId,
      observation,
    } = params;

    if (!productId || !quantity) {
      throw new Error("Produto e quantidade são obrigatórios");
    }

    if (quantity <= 0) {
      throw new Error(STOCK_MESSAGES.ERROR_INVALID_QUANTITY);
    }

    const { data: product, error: productError } = await this.supabase
      .from("products")
      .select("id, name, group_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error(STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND);
    }

    const { data: stockExists } = await this.supabase
      .from("stock")
      .select("unit_of_measure_code")
      .eq("productId", productId)
      .eq("organization_id", organizationId)
      .maybeSingle();

    const unitCode =
      unitOfMeasureCode ||
      (stockExists?.unit_of_measure_code as UnitOfMeasureCode | undefined) ||
      (product as { unit_of_measure_code?: UnitOfMeasureCode })
        .unit_of_measure_code ||
      "un";

    const { data: movement, error: movementError } = await this.supabase
      .from("stock_movements")
      .insert({
        productId,
        userId,
        organization_id: organizationId,
        movement_type: "ENTRADA",
        quantity,
        unit_of_measure_code: unitCode,
        storage_location_id: storageLocationId || null,
        observation: observation || `Entrada rápida - ${product.name}`,
      })
      .select(
        `
        *,
        product:products(id, name, group_id)
      `
      )
      .single();

    if (movementError || !movement) {
      throw new Error(
        movementError?.message ||
          movementError?.details ||
          "Erro ao registrar movimentação de estoque"
      );
    }

    const movementDto: StockMovementResponseDto = toStockMovementResponseDto(
      movement as MovementWithRelations
    );

    // Update storage_location_id on stock table if provided
    if (storageLocationId) {
      await this.supabase
        .from("stock")
        .update({ storage_location_id: storageLocationId })
        .eq("productId", productId)
        .eq("organization_id", organizationId);
    }

    const { data: updatedStock, error: stockError } = await this.supabase
      .from("stock")
      .select(
        `
        *,
        product:products(id, name, group_id),
        storage_location:storage_locations(id, name, parent_id)
      `
      )
      .eq("productId", productId)
      .eq("organization_id", organizationId)
      .single();

    let updatedStockDto: StockResponseDto | undefined;

    if (updatedStock) {
      updatedStockDto = toStockResponseDto(
        updatedStock as StockEntity & { product?: ProductJoin }
      );
    } else if (stockError) {
      console.warn("Erro ao buscar estoque atualizado:", stockError);
    }

    return {
      message: STOCK_MESSAGES.ENTRY_SUCCESS,
      movement: movementDto,
      updatedStock: updatedStockDto,
    };
  }

  /**
   * Registra uma saída rápida de estoque e retorna DTOs normalizados
   */
  async registerQuickExit(params: {
    productId: number;
    quantity: number;
    userId: string;
    organizationId: string;
    unitOfMeasureCode?: UnitOfMeasureCode;
    observation?: string;
  }): Promise<QuickEntryResponseDto> {
    const {
      productId,
      quantity,
      userId,
      organizationId,
      unitOfMeasureCode,
      observation,
    } = params;

    if (!productId || !quantity) {
      throw new Error("Produto e quantidade são obrigatórios");
    }

    if (quantity <= 0) {
      throw new Error(STOCK_MESSAGES.ERROR_INVALID_QUANTITY);
    }

    const { data: product, error: productError } = await this.supabase
      .from("products")
      .select("id, name, group_id")
      .eq("id", productId)
      .single();

    if (productError || !product) {
      throw new Error(STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND);
    }

    const { data: stockRow, error: stockError } = await this.supabase
      .from("stock")
      .select("id, current_quantity, unit_of_measure_code")
      .eq("productId", productId)
      .eq("organization_id", organizationId)
      .single();

    if (stockError || !stockRow) {
      throw new Error(STOCK_MESSAGES.ERROR_PRODUCT_NOT_FOUND);
    }

    const availableQuantity = Number(stockRow.current_quantity ?? 0);
    if (availableQuantity < quantity) {
      throw new Error(STOCK_MESSAGES.ERROR_INSUFFICIENT_QUANTITY);
    }

    const unitCode =
      unitOfMeasureCode ||
      (stockRow.unit_of_measure_code as UnitOfMeasureCode | undefined) ||
      (product as { unit_of_measure_code?: UnitOfMeasureCode })
        .unit_of_measure_code ||
      "un";

    const { data: movement, error: movementError } = await this.supabase
      .from("stock_movements")
      .insert({
        productId,
        userId,
        organization_id: organizationId,
        movement_type: "SAIDA",
        quantity,
        unit_of_measure_code: unitCode,
        observation: observation || `Saída rápida - ${product.name}`,
      })
      .select(
        `
        *,
        product:products(id, name, group_id)
      `
      )
      .single();

    if (movementError || !movement) {
      throw new Error(
        movementError?.message ||
          movementError?.details ||
          "Erro ao registrar movimentação de estoque"
      );
    }

    const movementDto: StockMovementResponseDto = toStockMovementResponseDto(
      movement as MovementWithRelations
    );

    const { data: updatedStock } = await this.supabase
      .from("stock")
      .select(
        `
        *,
        product:products(id, name, group_id)
      `
      )
      .eq("productId", productId)
      .eq("organization_id", organizationId)
      .single();

    let updatedStockDto: StockResponseDto | undefined;

    if (updatedStock) {
      updatedStockDto = toStockResponseDto(
        updatedStock as StockEntity & { product?: ProductJoin }
      );
    }

    return {
      message: STOCK_MESSAGES.EXIT_SUCCESS,
      movement: movementDto,
      updatedStock: updatedStockDto,
    };
  }
}
