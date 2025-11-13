import { NextRequest, NextResponse } from "next/server";
import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ApiSuccessResponse, ApiErrorResponse } from "@/types/common/api";

export async function GET(request: NextRequest) {
  try {
    // Get bearer token from Authorization header
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");

    if (!token) {
      const errorResponse: ApiErrorResponse = {
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const supabase = getSupabaseBearerClient(token);

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "Unauthorized",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const userId = searchParams.get("userId") || user.id;

    // Get user organizations
    const { data, error } = await supabase
      .from("user_organizations")
      .select("*")
      .eq("user_id", userId)
      .eq("active", true);

    if (error) {
      console.error("Error fetching user organizations:", error);
      const errorResponse: ApiErrorResponse = {
        error: "Error fetching user organizations",
      };
      return NextResponse.json(errorResponse, { status: 500 });
    }

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
