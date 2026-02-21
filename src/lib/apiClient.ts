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

// Interceptor de erros (opcional)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Tratamento global de erros
    if (error.response?.status === 401) {
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
