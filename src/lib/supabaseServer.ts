import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";

/**
 * Cria um cliente Supabase para uso em rotas API/server
 * Lê os cookies da requisição automaticamente
 */
export function getSupabaseServerClient(request?: NextRequest) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          if (request) {
            return request.cookies.getAll();
          }
          // Fallback para rotas que não passam request
          return [];
        },
        setAll(cookiesToSet) {
          // Cookies não são setados em rotas API
        },
      },
    }
  );
}
