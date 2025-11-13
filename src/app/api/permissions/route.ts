import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { PermissionBackendService } from "@/lib/services/server/permissionService";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { success: false, error: "Access token not provided" },
      { status: 401 }
    );
  }
  try {
    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    if (error || !user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 }
      );
    }
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "organizationId is required" },
        { status: 400 }
      );
    }
    const service = new PermissionBackendService(supabase);
    const permissions = await service.getUserPermissions(
      user.id,
      organizationId
    );
    return NextResponse.json(permissions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error while fetching permissions" },
      { status: 500 }
    );
  }
}
