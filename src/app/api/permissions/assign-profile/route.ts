import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { PermissionBackendService } from "@/lib/services/server/permissionService";

export async function POST(request: NextRequest) {
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
    const { userOrganizationId, profileId } = await request.json();
    if (!userOrganizationId || !profileId) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 }
      );
    }
    const service = new PermissionBackendService(supabase);
    const result = await service.assignProfileToUser(
      userOrganizationId,
      profileId
    );
    return NextResponse.json(
      { success: result },
      { status: result ? 200 : 400 }
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error while assigning profile" },
      { status: 500 }
    );
  }
}
