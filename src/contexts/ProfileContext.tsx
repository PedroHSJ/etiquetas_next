"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { getAvailableProfiles } from "@/lib/services/profileService";
import { PermissionService } from "@/lib/services/permissionService";
import { UserProfile, UsuarioPermissoes } from "@/types";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileContextType {
  activeProfile: UserProfile | null;
  userProfiles: UserProfile[];
  userPermissoes: UsuarioPermissoes | null;
  loading: boolean;
  setActiveProfile: (profile: UserProfile | null) => void;
  refreshProfiles: () => Promise<void>;
  refreshPermissoes: () => Promise<void>;
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
  const [userPermissoes, setUserPermissoes] =
    useState<UsuarioPermissoes | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log(userProfiles);
  }, [userProfiles]);
  // Carregar perfis do usuário
  const loadProfiles = async () => {
    try {
      setLoading(true);
      if (!user?.id) {
        setUserProfiles([]);
        setLoading(false);
        return;
      }
      const profiles = await getAvailableProfiles(user.id);
      console.log(profiles);
      setUserProfiles(profiles);

      // Restaurar perfil ativo do localStorage se existir
  const savedProfileId = typeof window !== 'undefined' ? localStorage.getItem("activeProfileId") : null;
      if (savedProfileId && profiles.length > 0) {
        const savedProfile = profiles.find((p) => p.id === savedProfileId);
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
  const loadPermissoes = async () => {
    if (!activeProfile) {
      setUserPermissoes(null);
      return;
    }

    try {
      const permissoes = await PermissionService.getUsuarioPermissoes(
        activeProfile.usuario_id,
        activeProfile.organizacao_id
      );
      setUserPermissoes(permissoes);
    } catch (error) {
      console.error("Erro ao carregar permissões:", error);
      setUserPermissoes(null);
    }
  };

  const refreshAll = () => {
    refreshProfiles();
    refreshPermissoes();
  };

  // Carregar perfis quando o usuário autenticado mudar (ou na montagem)
  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  // Carregar permissões quando o perfil ativo mudar
  useEffect(() => {
    loadPermissoes();
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

  const refreshPermissoes = async () => {
    await loadPermissoes();
  };

  const value: ProfileContextType = {
    activeProfile,
    userProfiles,
    userPermissoes,
    loading,
    setActiveProfile,
    refreshProfiles,
    refreshPermissoes,
    refreshAll,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
