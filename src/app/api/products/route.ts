import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { ProductBackendService } from "@/lib/services/server/productService";

// GET /api/products
export async function GET(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const organizationId = searchParams.get("organizationId");
    const groupId = searchParams.get("groupId");

    const service = new ProductBackendService();
    // Filtros
    const products = await service.getProducts({
      organizationId: organizationId || undefined,
      groupId: groupId ? parseInt(groupId) : undefined,
    });
    return NextResponse.json(products);
  } catch (err: unknown) {
    console.log(err);

    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}

// POST /api/products
export async function POST(request: NextRequest) {
  const session = await auth.api.getSession({
    headers: request.headers,
  });

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const service = new ProductBackendService();
    // TODO: Ensure organizationId in body matches user's organizations
    const product = await service.createProduct(body);
    return NextResponse.json(product);
  } catch (err: unknown) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Internal server error" },
      { status: 500 },
    );
  }
}
