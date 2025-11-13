"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserPermissions, UserProfile } from "@/types/models/profile";
import { ProfileService } from "@/lib/services/client/profile-service";
import { PermissionService } from "@/lib/services/client/permission-service";

interface ProfileContextType {
  activeProfile: UserProfile | null;
  userProfiles: UserProfile[];
  userPermissions: UserPermissions | null;
  loading: boolean;
  setActiveProfile: (profile: UserProfile | null) => void;
  refreshProfiles: () => Promise<void>;
  refreshPermissions: () => Promise<void>;
  refreshAll: () => void;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (context === undefined) {
    throw new Error("useProfile must be used within a ProfileProvider");
  }
  return context;
}

interface ProfileProviderProps {
  children: ReactNode;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const { user } = useAuth();
  const [activeProfile, setActiveProfile] = useState<UserProfile | null>(null);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [userPermissions, setUserPermissions] =
    useState<UserPermissions | null>(null);
  const [loading, setLoading] = useState(true);

  // Carregar perfis do usuário
  const loadProfiles = async () => {
    try {
      console.log("⚙️ Carregando perfis para o usuário:", user?.id);
      setLoading(true);
      if (!user?.id) {
        setUserProfiles([]);
        setLoading(false);
        return;
      }
      const profiles = await ProfileService.getAvailableProfiles();
      setUserProfiles(profiles);

      // Restaurar perfil ativo do localStorage se existir
      const savedProfileId =
        typeof window !== "undefined"
          ? localStorage.getItem("activeProfileId")
          : null;
      if (savedProfileId && profiles.length > 0) {
        const savedProfile = profiles.find(
          (p: UserProfile) => p.id === savedProfileId
        );
        if (savedProfile) {
          setActiveProfile(savedProfile);
        } else {
          // Se o perfil salvo não existe mais, usar o primeiro disponível
          setActiveProfile(profiles[0]);
        }
      } else if (profiles.length > 0) {
        // Se não há perfil salvo, usar o primeiro disponível
        setActiveProfile(profiles[0]);
      }
    } catch (error) {
      console.error("Erro ao carregar perfis:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar permissões do usuário
  const loadPermissions = async () => {
    if (
      !activeProfile ||
      !user?.id ||
      !activeProfile.userOrganization?.organizationId
    ) {
      setUserPermissions(null);
      return;
    }

    try {
      const permissions = await PermissionService.getUserPermissions(
        activeProfile.userOrganization.organizationId
      );
      setUserPermissions(permissions);
    } catch (error) {
      setUserPermissions(null);
    }
  };

  const refreshAll = () => {
    refreshProfiles();
    refreshPermissions();
  };

  // Carregar perfis quando o usuário autenticado mudar (ou na montagem)
  useEffect(() => {
    if (!user?.id) return;
    loadProfiles();
  }, [user?.id]);

  // Carregar permissões quando o perfil ativo mudar
  useEffect(() => {
    if (!activeProfile) return;
    loadPermissions();
  }, [activeProfile]);

  // Salvar perfil ativo no localStorage
  useEffect(() => {
    if (activeProfile) {
      localStorage.setItem("activeProfileId", activeProfile.id);
    } else {
      localStorage.removeItem("activeProfileId");
    }
  }, [activeProfile]);

  const refreshProfiles = async () => {
    await loadProfiles();
  };

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  const value: ProfileContextType = {
    activeProfile,
    userProfiles,
    userPermissions,
    loading,
    setActiveProfile,
    refreshProfiles,
    refreshPermissions,
    refreshAll,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
