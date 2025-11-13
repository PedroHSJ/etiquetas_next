import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ProductBackendService } from "@/lib/services/server/productService";

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const updated = await service.updateGroup(Number(params.id), body);
    return NextResponse.json(updated);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { error: "Access token not provided" },
      { status: 401 }
    );
  }
  try {
    const supabase = getSupabaseBearerClient(token);
    const service = new ProductBackendService(supabase);
    await service.deleteGroup(Number(params.id));
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
