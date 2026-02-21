import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { PermissionService } from "@/lib/services/client/permission-service";
import { UserPermissions } from "@/types/models/profile";
import {
  FunctionalityCode,
  FunctionalityCodeType,
} from "@/types/models/functionality";

export function usePermissions() {
  const { user } = useAuth();
  const { activeProfile } = useProfile();
  const [permissions, setPermissions] = useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && activeProfile) {
      loadPermissions();
    } else {
      setPermissions(null);
      setLoading(false);
    }
  }, [user, activeProfile]);

  const loadPermissions = async () => {
    if (
      !user ||
      !activeProfile ||
      !activeProfile.userOrganization?.organization?.id
    )
      return;

    try {
      setLoading(true);
      const data = await PermissionService.getUserPermissions(
        activeProfile.userOrganization?.organization?.id,
      );
      setPermissions(data);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Verifica se o usuário tem permissão para uma funcionalidade específica
   * @param functionalityCode - Código da funcionalidade (ex: 'STOCK:READ', 'MEMBERS:WRITE')
   */
  const hasPermissionByCode = (
    functionalityCode: FunctionalityCodeType | string,
  ): boolean => {
    //if (process.env.NODE_ENV === "development") return true;
    if (!permissions) return false;

    // Usuários Gestor têm acesso total
    const isManager = permissions.profiles.some(
      (profile) => profile.name.toLowerCase() === "gestor",
    );
    if (isManager) return true;

    // Verificar permissão específica pelo código
    return permissions.permissions.some((permission) => {
      return (
        permission.functionality?.code === functionalityCode &&
        permission.active
      );
    });
  };

  /**
   * Verifica se o usuário pode ler um módulo
   * @param module - Nome do módulo (ex: 'STOCK', 'MEMBERS', 'LABELS')
   */
  const canRead = (module: string): boolean => {
    return hasPermissionByCode(`${module}:READ`);
  };

  /**
   * Verifica se o usuário pode escrever em um módulo
   * @param module - Nome do módulo (ex: 'STOCK', 'MEMBERS', 'LABELS')
   */
  const canWrite = (module: string): boolean => {
    return hasPermissionByCode(`${module}:WRITE`);
  };

  // Legacy methods for backwards compatibility
  const hasPermission = (functionality: string, action: string): boolean => {
    if (!permissions) return false;

    // Usuários Gestor têm acesso total
    const isManager = permissions.profiles.some(
      (profile) => profile.name.toLowerCase() === "gestor",
    );
    if (isManager) return true;

    // Verificar permissão específica
    return permissions.permissions.some((permission) => {
      if (
        permission.functionality?.name === functionality &&
        permission.action === action
      ) {
        return permission.active;
      }
      return false;
    });
  };

  const hasPermissionToView = (functionality: string): boolean => {
    return hasPermission(functionality, "visualizar");
  };

  const hasPermissionToCreate = (functionality: string): boolean => {
    return hasPermission(functionality, "criar");
  };

  const hasPermissionToEdit = (functionality: string): boolean => {
    return hasPermission(functionality, "editar");
  };

  const hasPermissionToDelete = (functionality: string): boolean => {
    return hasPermission(functionality, "excluir");
  };

  const hasPermissionToManage = (functionality: string): boolean => {
    return hasPermission(functionality, "gerenciar");
  };

  const isMaster = (): boolean => {
    if (!permissions) return false;
    return permissions.profiles.some(
      (profile) => profile.name.toLowerCase() === "master",
    );
  };

  const isGestor = (): boolean => {
    if (!permissions) return false;
    return permissions.profiles.some(
      (profile) =>
        profile.name.toLowerCase() === "gestor" ||
        profile.name.toLowerCase() === "master",
    );
  };

  const isEstoquista = (): boolean => {
    if (!permissions) return false;
    return permissions.profiles.some(
      (profile) => profile.name.toLowerCase() === "estoquista",
    );
  };

  const isCozinheiro = (): boolean => {
    if (!permissions) return false;
    return permissions.profiles.some(
      (profile) => profile.name.toLowerCase() === "cozinheiro",
    );
  };

  const getProfiles = () => {
    return permissions?.profiles || [];
  };

  const refreshPermissions = () => {
    loadPermissions();
  };

  return {
    permissions,
    loading,
    // New code-based methods
    hasPermissionByCode,
    canRead,
    canWrite,
    // Legacy methods
    hasPermission,
    hasPermissionToView,
    hasPermissionToCreate,
    hasPermissionToEdit,
    hasPermissionToDelete,
    hasPermissionToManage,
    // Role checks
    isMaster,
    isGestor,
    isEstoquista,
    isCozinheiro,
    // Utilities
    getProfiles,
    refreshPermissions,
    // Re-export FunctionalityCode for convenience
    FunctionalityCode,
  };
}
