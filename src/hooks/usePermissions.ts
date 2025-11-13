import { useContext, useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/contexts/ProfileContext";
import { PermissionService } from "@/lib/services/client/permission-service";
import { UserPermissions } from "@/types/models/profile";

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
      !activeProfile.userOrganization?.organizationId
    )
      return;

    try {
      setLoading(true);
      const data = await PermissionService.getUserPermissions(
        activeProfile.userOrganization?.organizationId
      );
      setPermissions(data);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      setPermissions(null);
    } finally {
      setLoading(false);
    }
  };

  const hasPermission = (functionality: string, action: string): boolean => {
    if (process.env.NODE_ENV === "development") return true;
    if (!permissions) return false;

    // Usuários master têm acesso total
    const hasMasterProfile = permissions.profiles.some(
      (profile) => profile.name === "master"
    );
    if (hasMasterProfile) return true;

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
    return permissions.profiles.some((profile) => profile.name === "master");
  };

  const isGestor = (): boolean => {
    if (!permissions) return false;
    return permissions.profiles.some(
      (profile) => profile.name === "gestor" || profile.name === "master"
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
    hasPermission,
    hasPermissionToView,
    hasPermissionToCreate,
    hasPermissionToEdit,
    hasPermissionToDelete,
    hasPermissionToManage,
    isMaster,
    isGestor,
    getProfiles,
    refreshPermissions,
  };
}
