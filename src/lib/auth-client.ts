import { createAuthClient } from "better-auth/react";

/**
 * Cliente de autenticação do Better Auth
 *
 * Usa window.location.origin no cliente para suportar diferentes portas
 * automaticamente (útil quando o Docker usa :3000 e dev local usa :3001)
 */
const getBaseURL = () => {
  // No cliente, usa a origem atual (window.location.origin)
  if (typeof window !== "undefined") {
    return window.location.origin;
  }

  // No servidor, usa a variável de ambiente
  return process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
};

export const authClient = createAuthClient({
  baseURL: getBaseURL(),
});
