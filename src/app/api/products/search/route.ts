import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProductBackendService } from "@/lib/services/server/productService";

// GET /api/products/search?organizationId=xxx&query=xxx
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const organizationId = searchParams.get("organizationId");
  const query = searchParams.get("query") || "";
  if (!organizationId) {
    return NextResponse.json(
      { error: "organizationId is required" },
      { status: 400 },
    );
  }
  try {
    const service = new ProductBackendService();
    const products = await service.searchProducts(organizationId, query);
    return NextResponse.json(products);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
