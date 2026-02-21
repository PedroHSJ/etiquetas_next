/**
 * Faz uma requisição fetch protegida.
 * Utiliza o sistema de cookies do Better Auth para autenticação,
 * portanto não precisa injetar token Bearer manualmente.
 *
 * Mantemos a função para ter um wrapper consistente que pode ser estendido
 * para tratamento de erros 401, refresh tokens, etc.
 */
export async function fetchWithAuth(
  input: RequestInfo | URL,
  init?: RequestInit,
) {
  // Configurações padrão
  const config = {
    ...init,
    // Garantir que cookies sejam enviados em requisições same-origin
    credentials: init?.credentials ?? "include",
    headers: {
      ...init?.headers,
    },
  };

  const response = await fetch(input, config);

  // Opcional: Interceptador de 401 para redirecionar login ou tratar expiração
  if (response.status === 401) {
    // Pode disparar um evento ou redirecionar
    if (typeof window !== "undefined") {
      // window.location.href = "/sign-in";
    }
  }

  return response;
}
