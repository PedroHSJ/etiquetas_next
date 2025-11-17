import type { SupabaseClient } from "@supabase/supabase-js";
import {
  EstoqueListResponse,
  MovimentacoesListResponse,
  EstoqueFiltros,
  MovimentacoesFiltros,
} from "@/types/estoque";
import { Stock, StockMovement, StockStatistics } from "@/types/stock/stock";

interface ListStockParams {
  page: number;
  pageSize: number;
  filters?: EstoqueFiltros;
}

interface ListMovementsParams {
  page: number;
  pageSize: number;
  filters?: MovimentacoesFiltros;
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
  }: ListStockParams): Promise<EstoqueListResponse> {
    const offset = (page - 1) * pageSize;

    let query = this.supabase
      .from("stock")
      .select(
        `
        *,
        product:products(*)
      `,
        { count: "exact" }
      )
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
      throw new Error(
        error.message || "Error while fetching stock movements"
      );
    }

    return {
      data: (data ?? []) as StockMovement[],
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  /**
   * Calcula estatísticas básicas do estoque.
   */
  async getStatistics(): Promise<StockStatistics> {
    const { data, error } = await this.supabase
      .from("stock")
      .select("current_quantity");

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
}
