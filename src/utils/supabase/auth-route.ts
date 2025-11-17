import { getSupabaseBearerClient } from "@/lib/supabaseServer";
import { ApiErrorResponse } from "@/types/common";
import { User } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export async function authRoute(request: Request): Promise<
  | {
      supabase: ReturnType<typeof getSupabaseBearerClient>;
      user: User;
    }
  | NextResponse
> {
  const authHeader = request.headers.get("Authorization");
  const token = authHeader?.replace("Bearer ", "");

  if (!token) {
    const errorResponse: ApiErrorResponse = {
      error: "Access token not provided",
    };
    throw new Error(
      JSON.stringify(NextResponse.json(errorResponse, { status: 401 }))
    );
  }

  try {
    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      console.error("Auth error in /api/invites:", error);
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      throw new Error(
        JSON.stringify(NextResponse.json(errorResponse, { status: 401 }))
      );
    }
    return { supabase, user } as const;
  } catch (error) {
    const errorResponse: ApiErrorResponse = {
      error: "Internal error during authentication",
    };
    throw new Error(
      JSON.stringify(NextResponse.json(errorResponse, { status: 500 }))
    );
  }
}
