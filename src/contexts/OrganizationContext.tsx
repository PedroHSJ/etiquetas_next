"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useProfile } from "./ProfileContext";
import { Organization } from "@/types/models/organization";
import { OrganizationService } from "@/lib/services/client/organization-service";

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  activeOrganizationDetails: Organization | null;
  setSelectedOrganization: (org: Organization) => void;
  loading: boolean;
  detailsLoading: boolean;
  refetchOrganizations: () => Promise<void>;
  refreshActiveOrganization: () => Promise<void>;
  onOrganizationCreated: (newOrganization: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined,
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId, session } = useAuth();
  const { activeProfile } = useProfile();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [activeOrganizationDetails, setActiveOrganizationDetails] =
    useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const router = useRouter();

  // Função para buscar organizações do usuário
  const fetchOrganizations = useCallback(async () => {
    // if (!session?.access_token) return; // Removido
    if (!session?.user) return;

    setLoading(true);
    try {
      const organizationsData = await OrganizationService.getOrganizations();

      setOrganizations(organizationsData as unknown as Organization[]);
      setSelectedOrganization((current) => {
        if (organizationsData.length === 0) {
          router.push("/onboarding");
          return null;
        }

        if (!current && organizationsData.length > 0) {
          return organizationsData[0] as unknown as Organization;
        }

        if (
          current &&
          !organizationsData.find((org) => org.id === current.id)
        ) {
          return (organizationsData[0] as unknown as Organization) || null;
        }

        return current;
      });
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
    } finally {
      setLoading(false);
    }
  }, [session?.user]);

  // Carregar detalhes completos da organização ativa
  const loadActiveOrganizationDetails = async (organizationId: string) => {
    try {
      setDetailsLoading(true);
      const details =
        await OrganizationService.getOrganizationByIdExpanded(organizationId);
      setActiveOrganizationDetails(details as unknown as Organization);
    } catch (error) {
      console.error("Erro ao carregar detalhes da organização:", error);
      setActiveOrganizationDetails(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const refreshActiveOrganization = async () => {
    const orgId = selectedOrganization?.id;
    if (orgId) {
      await loadActiveOrganizationDetails(orgId);
    }
  };

  const refetchOrganizations = useCallback(async () => {
    await fetchOrganizations();
  }, [fetchOrganizations]);

  const onOrganizationCreated = (newOrganization: Organization) => {
    // Adicionar a nova organização à lista
    setOrganizations((prev) => [newOrganization, ...prev]);
    // Selecionar automaticamente a nova organização
    setSelectedOrganization(newOrganization);
    // Salvar no localStorage
    localStorage.setItem("selectedOrganizationId", newOrganization.id);
    // Carregar detalhes da nova organização
    loadActiveOrganizationDetails(newOrganization.id);
  };

  useEffect(() => {
    if (userId && session?.user) {
      fetchOrganizations();
    }
  }, [userId, session?.user, fetchOrganizations]);

  // Efeito para carregar detalhes quando a organização selecionada mudar
  useEffect(() => {
    if (selectedOrganization?.id) {
      loadActiveOrganizationDetails(selectedOrganization.id);
    }
  }, [selectedOrganization?.id]);

  // Efeito para carregar detalhes quando o perfil ativo mudar
  useEffect(() => {
    if (
      activeProfile?.userOrganization?.organization?.id &&
      organizations.length > 0
    ) {
      // Se o perfil ativo tem uma organização diferente da selecionada
      // Procurar a organização correspondente na lista
      const profileOrg = organizations.find(
        (org) => org.id === activeProfile.userOrganization?.organization?.id,
      );
      if (
        profileOrg &&
        (!selectedOrganization || profileOrg.id !== selectedOrganization.id)
      ) {
        setSelectedOrganization(profileOrg);
      }
    }
  }, [
    activeProfile?.userOrganization?.organization?.id,
    organizations,
    selectedOrganization?.id,
  ]);

  // Salvar organização selecionada no localStorage
  useEffect(() => {
    if (selectedOrganization) {
      localStorage.setItem("selectedOrganizationId", selectedOrganization.id);
    }
  }, [selectedOrganization]);

  // Recuperar organização selecionada do localStorage na inicialização
  useEffect(() => {
    if (organizations.length > 0 && !selectedOrganization) {
      const savedOrgId = localStorage.getItem("selectedOrganizationId");
      if (savedOrgId) {
        const savedOrg = organizations.find((org) => org.id === savedOrgId);
        if (savedOrg) {
          setSelectedOrganization(savedOrg);
        } else {
          setSelectedOrganization(organizations[0]);
        }
      } else {
        setSelectedOrganization(organizations[0]);
      }
    }
  }, [organizations, selectedOrganization]);

  const value = {
    organizations,
    selectedOrganization,
    activeOrganizationDetails,
    setSelectedOrganization,
    loading,
    detailsLoading,
    refetchOrganizations,
    refreshActiveOrganization,
    onOrganizationCreated,
  };

  return (
    <OrganizationContext.Provider value={value}>
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error(
      "useOrganization deve ser usado dentro de um OrganizationProvider",
    );
  }
  return context;
}

export { OrganizationContext };
