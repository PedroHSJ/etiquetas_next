import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";

export async function GET(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session) {
      const errorResponse: ApiErrorResponse = {
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || session.user.id;

    // Only allow user to see their own organizations or admin to see others
    if (userId !== session.user.id) {
      // TODO: Add admin permission check here
    }

    // Get user organizations
    const data = await prisma.user_organizations.findMany({
      where: {
        userId,
        active: true,
      },
    });

    const successResponse: ApiSuccessResponse<typeof data> = {
      data: data,
    };
    return NextResponse.json(successResponse, { status: 200 });
  } catch (error) {
    console.error("Error in user-organizations endpoint:", error);
    const errorResponse: ApiErrorResponse = {
      error: "Internal server error",
    };
    return NextResponse.json(errorResponse, { status: 500 });
  }
}
