import { getSupabaseServerClient } from "@/lib/supabaseServer";
import { NextRequest } from "next/server";

export async function isUserAuthenticated(req: NextRequest): Promise<boolean> {
  const supabase = getSupabaseServerClient(req);
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();
  return !!user && !error;
}
