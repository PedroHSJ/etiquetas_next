import { NextRequest, NextResponse } from "next/server";
import { PermissionBackendService } from "@/lib/services/server/permissionService";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
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

    const { userOrganizationId, profileId } = await request.json();
    if (!userOrganizationId || !profileId) {
      return NextResponse.json(
        { success: false, error: "Missing parameters" },
        { status: 400 },
      );
    }
    const service = new PermissionBackendService();
    const result = await service.assignProfileToUser(
      userOrganizationId,
      profileId,
    );
    return NextResponse.json(
      { success: result },
      { status: result ? 200 : 400 },
    );
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal error while assigning profile" },
      { status: 500 },
    );
  }
}
