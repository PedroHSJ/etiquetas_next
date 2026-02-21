"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { useAuth } from "@/contexts/AuthContext";
import { UserProfileResponseDto } from "@/types/dto/profile/response";
import { UserPermissions } from "@/types/models/profile";
import { PermissionService } from "@/lib/services/client/permission-service";
import {
  useUserProfilesQuery,
  useInvalidateUserProfiles,
} from "@/hooks/useUserProfilesQuery";

interface ProfileContextType {
  activeProfile: UserProfileResponseDto | null;
  userProfiles: UserProfileResponseDto[];
  userPermissions: UserPermissions | null;
  loading: boolean;
  setActiveProfile: (profile: UserProfileResponseDto | null) => void;
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
  const [activeProfile, setActiveProfile] =
    useState<UserProfileResponseDto | null>(null);
  const [userPermissions, setUserPermissions] =
    useState<UserPermissions | null>(null);

  // Usar React Query para gerenciar perfis
  const {
    userProfiles,
    isLoading: profilesLoading,
    refetch: refetchProfiles,
  } = useUserProfilesQuery();
  const invalidateProfiles = useInvalidateUserProfiles();

  // Carregar permissões do usuário
  const loadPermissions = async () => {
    if (
      !activeProfile ||
      !user?.id ||
      !activeProfile.userOrganization?.organization?.id
    ) {
      setUserPermissions(null);
      return;
    }

    try {
      const permissions = await PermissionService.getUserPermissions(
        activeProfile.userOrganization.organization.id,
      );
      setUserPermissions(permissions);
    } catch (error) {
      console.error(error);
      setUserPermissions(null);
    }
  };

  const refreshAll = () => {
    refreshProfiles();
    refreshPermissions();
  };

  // Atualizar perfil ativo quando perfis carregarem ou mudarem
  useEffect(() => {
    if (userProfiles.length === 0) return;

    // Restaurar perfil ativo do localStorage se existir
    const savedProfileId =
      typeof window !== "undefined"
        ? localStorage.getItem("activeProfileId")
        : null;

    if (savedProfileId) {
      const savedProfile = userProfiles.find(
        (p: UserProfileResponseDto) => p.id === savedProfileId,
      );
      if (savedProfile) {
        setActiveProfile(savedProfile);
        return;
      }
    }

    // Se não há perfil salvo ou não existe mais, usar o primeiro disponível
    if (
      !activeProfile ||
      !userProfiles.find((p) => p.id === activeProfile.id)
    ) {
      setActiveProfile(userProfiles[0]);
    }
  }, [userProfiles]);

  // Carregar permissões quando o perfil ativo mudar
  useEffect(() => {
    if (!activeProfile) return;
    loadPermissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    await invalidateProfiles();
    await refetchProfiles();
  };

  const refreshPermissions = async () => {
    await loadPermissions();
  };

  const value: ProfileContextType = {
    activeProfile,
    userProfiles,
    userPermissions,
    loading: profilesLoading,
    setActiveProfile,
    refreshProfiles,
    refreshPermissions,
    refreshAll,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
}
