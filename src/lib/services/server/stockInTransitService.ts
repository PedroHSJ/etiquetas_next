import { SupabaseClient } from "@supabase/supabase-js";
import {
  StockInTransitResponseDto,
  StockInTransitListResponseDto,
} from "@/types/dto/stock-in-transit/response";
import {
  CreateStockInTransitDto,
  UpdateStockInTransitDto,
} from "@/types/dto/stock-in-transit/request";
import {
  toStockInTransitEntityForCreate,
  toStockInTransitEntityForUpdate,
  toStockInTransitResponseDto,
} from "@/lib/converters/stock-in-transit";

export class StockInTransitBackendService {
  constructor(private readonly supabase: SupabaseClient) {}

  async list(params: {
    page: number;
    pageSize: number;
    organizationId: string;
  }): Promise<StockInTransitListResponseDto> {
    const { page, pageSize, organizationId } = params;
    const offset = (page - 1) * pageSize;

    const { data, error, count } = await this.supabase
      .from("stock_in_transit")
      .select(
        `
        *,
        product:products(*)
      `,
        { count: "exact" },
      )
      .eq("organization_id", organizationId)
      .order("created_at", { ascending: false })
      .range(offset, offset + pageSize - 1);

    if (error) throw error;

    return {
      success: true,
      data: (data || []).map((item) => toStockInTransitResponseDto(item)),
      total: count || 0,
      page,
      pageSize,
      totalPages: Math.ceil((count || 0) / pageSize),
    };
  }

  async getById(id: string): Promise<StockInTransitResponseDto> {
    const { data, error } = await this.supabase
      .from("stock_in_transit")
      .select(
        `
        *,
        product:products(*)
      `,
      )
      .eq("id", id)
      .single();

    if (error) throw error;
    return toStockInTransitResponseDto(data);
  }

  async create(
    dto: CreateStockInTransitDto,
    userId: string,
    organizationId: string,
  ): Promise<StockInTransitResponseDto> {
    const entity = toStockInTransitEntityForCreate(dto, userId, organizationId);

    const { data, error } = await this.supabase
      .from("stock_in_transit")
      .insert(entity)
      .select(
        `
        *,
        product:products(*)
      `,
      )
      .single();

    if (error) throw error;
    return toStockInTransitResponseDto(data);
  }

  async update(
    id: string,
    dto: UpdateStockInTransitDto,
  ): Promise<StockInTransitResponseDto> {
    const { data, error } = await this.supabase
      .from("stock_in_transit")
      .update(toStockInTransitEntityForUpdate(dto))
      .eq("id", id)
      .select(
        `
        *,
        product:products(*)
      `,
      )
      .single();

    if (error) throw error;
    return toStockInTransitResponseDto(data);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase
      .from("stock_in_transit")
      .delete()
      .eq("id", id);

    if (error) throw error;
  }
}
