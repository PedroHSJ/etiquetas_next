import { supabase } from "@/lib/supabaseClient";

/**
 * Faz uma requisição fetch incluindo o token JWT do usuário autenticado no header Authorization.
 * Reutilizável para rotas protegidas.
 * Inclui credentials: 'include' para enviar cookies de autenticação.
 */
export async function fetchWithAuth(input: RequestInfo, init: RequestInit = {}) {
  // Obtém o token do usuário logado
  const { data } = await supabase.auth.getSession();
  const accessToken = data?.session?.access_token;

  // Adiciona o header Authorization se houver token
  const headers = new Headers(init.headers || {});
  if (accessToken) {
    headers.set("Authorization", `Bearer ${accessToken}`);
  }

  // Garante que os cookies de autenticação sejam enviados
  const credentials = init.credentials ?? "include";

  return fetch(input, { ...init, headers, credentials });
}
