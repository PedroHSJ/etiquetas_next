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
        { allowed: false, error: "User not authenticated" },
        { status: 401 },
      );
    }

    const organizationId = request.nextUrl.searchParams.get("organizationId");
    const functionalityName =
      request.nextUrl.searchParams.get("functionalityName");
    const action = request.nextUrl.searchParams.get("action");

    if (!organizationId || !functionalityName || !action) {
      return NextResponse.json(
        { allowed: false, error: "Missing parameters" },
        { status: 400 },
      );
    }

    const service = new PermissionBackendService();
    const allowed = await service.hasPermission(
      functionalityName,
      action,
      session.user.id,
      organizationId,
    );
    return NextResponse.json({ allowed }, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { allowed: false, error: "Internal error while checking permission" },
      { status: 500 },
    );
  }
}
