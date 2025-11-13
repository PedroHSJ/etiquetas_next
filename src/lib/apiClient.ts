import axios from "axios";
import { supabase } from "@/lib/supabaseClient";

/**
 * Cliente Axios compartilhado para chamadas às rotas internas da aplicação.
 * Mantemos a base relativa para funcionar no browser e no server.
 */
export const api = axios.create({
  baseURL: "/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 15000,
});

// Interceptor para adicionar o token automaticamente em todas as requisições
api.interceptors.request.use(
  async (config) => {
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (session?.access_token) {
      config.headers.Authorization = `Bearer ${session.access_token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
