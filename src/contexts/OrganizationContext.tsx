"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "./AuthContext";
import { useProfile } from "./ProfileContext";
import { UANService } from "@/lib/services/UANService";
import { OrganizacaoExpandida } from "@/types/uan";
import { OrganizationService } from "@/lib/services/organization-service";

interface Organization {
  id: string;
  nome: string;
  tipo: string;
  created_at: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  activeOrganizationDetails: OrganizacaoExpandida | null;
  setSelectedOrganization: (org: Organization) => void;
  loading: boolean;
  detailsLoading: boolean;
  refetchOrganizations: () => Promise<void>;
  refreshActiveOrganization: () => Promise<void>;
  onOrganizationCreated: (newOrganization: Organization) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { userId } = useAuth();
  const { activeProfile } = useProfile();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);
  const [activeOrganizationDetails, setActiveOrganizationDetails] =
    useState<OrganizacaoExpandida | null>(null);
  const [loading, setLoading] = useState(true);
  const [detailsLoading, setDetailsLoading] = useState(false);

  // Função para buscar organizações do usuário

  const fetchOrganizations = async () => {
    if (!userId) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("organizacoes")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      const response = await OrganizationService.getOrganizations(userId);
      console.table(response);
      if (!error && data) {
        setOrganizations(data);

        // Se não há organização selecionada, selecionar a primeira
        if (!selectedOrganization && data.length > 0) {
          setSelectedOrganization(data[0]);
        }

        // Se a organização selecionada não existe mais na lista, selecionar a primeira
        if (
          selectedOrganization &&
          !data.find((org) => org.id === selectedOrganization.id)
        ) {
          setSelectedOrganization(data[0] || null);
        }
      }
    } catch (error) {
      console.error("Erro ao buscar organizações:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carregar detalhes completos da organização ativa
  const loadActiveOrganizationDetails = async (organizacaoId: string) => {
    try {
      setDetailsLoading(true);
      const details = await UANService.getOrganizacaoById(organizacaoId);
      setActiveOrganizationDetails(details);
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

  const refetchOrganizations = async () => {
    await fetchOrganizations();
  };

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
    if (userId) {
      fetchOrganizations();

      // Listener em tempo real para mudanças na tabela organizacoes
      const channel = supabase
        .channel("organizacoes-changes")
        .on(
          "postgres_changes",
          {
            event: "*",
            schema: "public",
            table: "organizacoes",
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            console.log("Mudança detectada na tabela organizacoes:", payload);
            // Recarregar organizações quando houver mudanças
            fetchOrganizations();
          }
        )
        .subscribe();

      // Cleanup do listener
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [userId]);

  // Efeito para carregar detalhes quando a organização selecionada mudar
  useEffect(() => {
    if (selectedOrganization?.id) {
      loadActiveOrganizationDetails(selectedOrganization.id);
    }
  }, [selectedOrganization?.id]);

  // Efeito para carregar detalhes quando o perfil ativo mudar
  useEffect(() => {
    if (activeProfile?.organizacao?.nome && organizations.length > 0) {
      // Se o perfil ativo tem uma organização diferente da selecionada
      // Procurar a organização correspondente na lista
      const profileOrg = organizations.find(
        (org) => org.nome === activeProfile.organizacao.nome
      );
      if (
        profileOrg &&
        (!selectedOrganization || profileOrg.id !== selectedOrganization.id)
      ) {
        setSelectedOrganization(profileOrg);
      }
    }
  }, [
    activeProfile?.organizacao?.nome,
    organizations.length,
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
  }, [organizations]);

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
      "useOrganization deve ser usado dentro de um OrganizationProvider"
    );
  }
  return context;
}

export { OrganizationContext };
