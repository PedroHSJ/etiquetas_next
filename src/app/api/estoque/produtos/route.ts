import { NextRequest, NextResponse } from "next/server";
import {
  getSupabaseBearerClient,
  getSupabaseServerClient,
} from "@/lib/supabaseServer";
import { ApiErrorResponse, ApiSuccessResponse } from "@/types/common/api";
import { Product, ProductGroup } from "@/types/stock/product";

interface ProductWithGroup extends Omit<Product, "group"> {
  group?: ProductGroup | null;
}

interface StockRecord {
  productId: number;
  current_quantity: number;
  unit_of_measure_code: string | null;
}

interface ProductWithStock {
  id: number;
  name: string;
  group_id?: number | null;
  group?: ProductGroup | null;
  current_quantity: number;
  unit_of_measure_code: string;
}

// Endpoint to list products with stock metadata for quick entry dialog
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      const errorResponse: ApiErrorResponse = {
        error: "Access token not provided",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();
    const { searchParams } = new URL(request.url);
    const searchTerm = searchParams.get("q") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Query products
    let query = supabase.from("products").select(`
        id,
        name,
        group_id,
        group:groups(*)
      `);

    if (searchTerm) {
      query = query.ilike("name", `%${searchTerm}%`);
    }

    query = query.order("name", { ascending: true }).limit(limit);

    const { data: products, error: productsError } = await query;

    if (productsError) {
      console.error("Error fetching products:", productsError);
      const errorResponse: ApiErrorResponse = {
        error: "Failed to fetch products",
        details: { message: productsError.message },
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

    // Stock metadata per product
    const { data: stockRows, error: stockError } = await supabase
      .from("stock")
      .select("productId, current_quantity, unit_of_measure_code");

    if (stockError) {
      console.error("Error fetching stock info:", stockError);
    }

    const stockMap = (stockRows || []).reduce(
      (acc: Record<number, StockRecord>, e) => {
        const record = e as unknown as StockRecord;
        acc[record.productId] = record;
        return acc;
      },
      {}
    );

    const productsWithStock: ProductWithStock[] = (
      (products || []) as unknown as ProductWithGroup[]
    ).map((produto) => {
      const stockInfo = stockMap[produto.id];
      const quantity = stockInfo?.current_quantity || 0;
      const unit = stockInfo?.unit_of_measure_code || "un";

      return {
        id: produto.id,
        name: produto.name,
        group_id: produto.group_id,
        group: produto.group,
        unit_of_measure_code: unit,
        current_quantity: quantity,
      };
    });

    const successResponse: ApiSuccessResponse<ProductWithStock[]> = {
      data: productsWithStock,
    };

    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error on /api/estoque/produtos route:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal error while fetching products",
      details: error instanceof Error ? { message: error.message } : undefined,
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
