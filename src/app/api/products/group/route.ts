import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ProductBackendService } from "@/lib/services/server/productService";

// GET /api/products/group?organizationId=xxx
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
    const groups = await service.getGroups(organizationId);
    return NextResponse.json(groups);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

// POST /api/products/group
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
    const group = await service.createGroup(body);
    return NextResponse.json(group);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
