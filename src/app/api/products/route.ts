import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ProductBackendService } from "@/lib/services/server/productService";

// GET /api/products?organizationId=xxx
export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { error: "Access token not provided" },
      { status: 401 }
    );
  }
  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }
  try {
    const supabase = getSupabaseBearerClient(token);
    const service = new ProductBackendService(supabase);
    const products = await service.getProducts(organizationId);
    return NextResponse.json(products);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { error: "Access token not provided" },
      { status: 401 }
    );
  }
  try {
    const body = await request.json();
    const supabase = getSupabaseBearerClient(token);
    const service = new ProductBackendService(supabase);
    const product = await service.createProduct(body);
    return NextResponse.json(product);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 }
    );
  }
}
