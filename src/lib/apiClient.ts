import axios from "axios";

/**
 * Cliente Axios compartilhado para chamadas internas da API (/api).
 * Configurado para enviar cookies automaticamente (com credentials).
 */
export const api = axios.create({
  // Se estivermos chamando /api do frontend, Next.js proxying cuida do baseURL
  // Se for server-side (não deveria usar axios, mas sim direct calls), precisaria de URL absoluta
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
  withCredentials: true, // Importante para enviar cookies de sessão
});

// Inject the active organization ID automatically into all internal API routes
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const orgId = localStorage.getItem("selectedOrganizationId");
    if (orgId) {
      config.headers["X-Organization-Id"] = orgId;
    }
  }
  return config;
});

// Interceptor de erros (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        // Ignorar redirecionamento de login se a falha 401 veio explicitamente do Hub de Dispositivos (Proxy downstream)
        if (error.config?.url && !error.config.url.startsWith("/devices")) {
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  },
);

export default api;
