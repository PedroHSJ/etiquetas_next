import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { PermissionBackendService } from "@/lib/services/server/permissionService";

export async function GET(request: NextRequest) {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");
  if (!token) {
    return NextResponse.json(
      { allowed: false, error: "Access token not provided" },
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
        { allowed: false, error: "User not authenticated" },
        { status: 401 }
      );
    }
    const organizationId = request.nextUrl.searchParams.get("organizationId");
    const functionalityName =
      request.nextUrl.searchParams.get("functionalityName");
    const action = request.nextUrl.searchParams.get("action");
    if (!organizationId || !functionalityName || !action) {
      return NextResponse.json(
        { allowed: false, error: "Missing parameters" },
        { status: 400 }
      );
    }
    const service = new PermissionBackendService(supabase);
    const allowed = await service.hasPermission(
      functionalityName,
      action,
      user.id,
      organizationId
    );
    return NextResponse.json({ allowed }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { allowed: false, error: "Internal error while checking permission" },
      { status: 500 }
    );
  }
}
