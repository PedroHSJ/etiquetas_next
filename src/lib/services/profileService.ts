import { supabase } from "@/lib/supabaseClient";
import { UserProfile } from "@/types";

/**
 * Busca todos os perfis disponíveis para o usuário informado
 * @param userId id do usuário (auth.users)
 */
export const getAvailableProfiles = async (userId: string): Promise<UserProfile[]> => {
  try {
    if (!userId) {
      throw new Error("Usuário não autenticado");
    }

    const { data, error } = await supabase
      .from("usuarios_organizacoes")
      .select(
        `
          id,
          usuario_id,
          organizacao_id,
          perfil_id,
          ativo,
          created_at,
          organizacao:organizacoes (
            nome
          ),
          perfil:perfis (
            nome,
            descricao
          )
        `
      )
      .eq("usuario_id", userId)
      .eq("ativo", true);

    if (error) {
      console.error("Erro ao buscar perfis:", error);
      throw new Error("Erro ao buscar perfis do usuário");
    }

    if (!data) return [];
    // normalize possible array/object shapes returned by supabase
    return data.map((item: any) => ({
      id: item.id,
      usuario_id: item.usuario_id,
      organizacao_id: item.organizacao_id,
      perfil_id: item.perfil_id,
      ativo: item.ativo,
      created_at: item.created_at,
      organizacao: Array.isArray(item.organizacao)
        ? item.organizacao[0] || { nome: "Organização não encontrada" }
        : item.organizacao || { nome: "Organização não encontrada" },
      perfil: Array.isArray(item.perfil)
        ? item.perfil[0] || { nome: "Perfil não encontrado", descricao: "" }
        : item.perfil || { nome: "Perfil não encontrado", descricao: "" },
    }));
  } catch (error) {
    console.error("Erro no ProfileService.getAvailableProfiles:", error);
    throw error;
  }
};
