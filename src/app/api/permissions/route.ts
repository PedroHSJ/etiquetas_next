import { NextRequest, NextResponse } from "next/server";
import { PermissionBackendService } from "@/lib/services/server/permissionService";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      return NextResponse.json(
        { success: false, error: "User not authenticated" },
        { status: 401 },
      );
    }

    const organizationId = request.nextUrl.searchParams.get("organizationId");
    if (!organizationId) {
      return NextResponse.json(
        { success: false, error: "organizationId is required" },
        { status: 400 },
      );
    }
    const service = new PermissionBackendService();
    const permissions = await service.getUserPermissions(
      session.user.id,
      organizationId,
    );
    return NextResponse.json(permissions, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error while fetching permissions" },
      { status: 500 },
    );
  }
}
