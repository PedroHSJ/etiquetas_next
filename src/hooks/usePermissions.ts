import { useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { PermissionService } from "@/lib/services/permissionService";
import { UsuarioPermissoes } from "@/types/permissions";

export function usePermissions() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const [permissoes, setPermissoes] = useState<UsuarioPermissoes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && activeProfile) {
      loadPermissoes();
    } else {
      setPermissoes(null);
      setLoading(false);
    }
  }, [user, activeProfile]);

  const loadPermissoes = async () => {
    if (!user || !activeProfile) return;

    try {
      setLoading(true);
      const data = await PermissionService.getUsuarioPermissoes(
        user.id,
        activeProfile.organizacao_id
      );
      setPermissoes(data);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      setPermissoes(null);
    } finally {
      setLoading(false);
    }
  };

  const temPermissao = (funcionalidade: string, acao: string): boolean => {
    if (process.env.NODE_ENV === "development") return true;
    if (!permissoes) return false;

    // Usuários master têm acesso total
    const temPerfilMaster = permissoes.perfis.some((perfil) => perfil.nome === "master");
    if (temPerfilMaster) return true;

    // Verificar permissão específica
    return permissoes.permissoes.some((permissao) => {
      if (permissao.funcionalidade?.nome === funcionalidade && permissao.acao === acao) {
        return permissao.ativo;
      }
      return false;
    });
  };

  const temPermissaoVisualizar = (funcionalidade: string): boolean => {
    return temPermissao(funcionalidade, "visualizar");
  };

  const temPermissaoCriar = (funcionalidade: string): boolean => {
    return temPermissao(funcionalidade, "criar");
  };

  const temPermissaoEditar = (funcionalidade: string): boolean => {
    return temPermissao(funcionalidade, "editar");
  };

  const temPermissaoExcluir = (funcionalidade: string): boolean => {
    return temPermissao(funcionalidade, "excluir");
  };

  const temPermissaoGerenciar = (funcionalidade: string): boolean => {
    return temPermissao(funcionalidade, "gerenciar");
  };

  const isMaster = (): boolean => {
    if (!permissoes) return false;
    return permissoes.perfis.some((perfil) => perfil.nome === "master");
  };

  const isGestor = (): boolean => {
    if (!permissoes) return false;
    return permissoes.perfis.some((perfil) => perfil.nome === "gestor" || perfil.nome === "master");
  };

  const getPerfis = () => {
    return permissoes?.perfis || [];
  };

  const refreshPermissoes = () => {
    loadPermissoes();
  };

  return {
    permissoes,
    loading,
    temPermissao,
    temPermissaoVisualizar,
    temPermissaoCriar,
    temPermissaoEditar,
    temPermissaoExcluir,
    temPermissaoGerenciar,
    isMaster,
    isGestor,
    getPerfis,
    refreshPermissoes,
  };
}
