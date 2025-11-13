import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ProductBackendService } from "@/lib/services/server/productService";

// GET /api/products/search?organizationId=xxx&query=xxx
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
  const query = searchParams.get("query") || "";
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 }
    );
  }
  try {
    const supabase = getSupabaseBearerClient(token);
    const service = new ProductBackendService(supabase);
    const products = await service.searchProducts(organizationId, query);
    return NextResponse.json(products);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
