"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./AuthContext";
import { useProfile } from "./ProfileContext";
import { Organization } from "@/types/models/organization";
import {
  useOrganizationExpandedQuery,
  useOrganizationsQuery,
} from "@/hooks/useOrganizationsQuery";

interface OrganizationSelection {
  id: string;
}

interface OrganizationContextType {
  organizations: Organization[];
  selectedOrganization: Organization | null;
  activeOrganizationDetails: Organization | null;
  setSelectedOrganization: (org: OrganizationSelection) => void;
  loading: boolean;
  detailsLoading: boolean;
  refetchOrganizations: () => Promise<void>;
  refreshActiveOrganization: () => Promise<void>;
  onOrganizationCreated: (newOrganization: OrganizationSelection) => void;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(
  undefined,
);

export function OrganizationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const { loading: authLoading, session, userId } = useAuth();
  const { activeProfile, loading: profileLoading } = useProfile();
  const [selectedOrganizationId, setSelectedOrganizationId] = useState<
    string | null
  >(null);

  const organizationsQuery = useOrganizationsQuery();
  const organizations = organizationsQuery.data ?? [];

  const selectedOrganization = useMemo(() => {
    if (!selectedOrganizationId) {
      return null;
    }

    return (
      organizations.find(
        (organization) => organization.id === selectedOrganizationId,
      ) ?? null
    );
  }, [organizations, selectedOrganizationId]);

  const activeOrganizationQuery = useOrganizationExpandedQuery(
    selectedOrganizationId,
  );

  const activeOrganizationDetails = activeOrganizationQuery.data ?? null;
  const loading = authLoading || profileLoading || organizationsQuery.isLoading;
  const detailsLoading =
    Boolean(selectedOrganizationId) &&
    (activeOrganizationQuery.isLoading || activeOrganizationQuery.isFetching);

  const setSelectedOrganization = useCallback((organization: OrganizationSelection) => {
    setSelectedOrganizationId(organization.id);
  }, []);

  const refetchOrganizations = useCallback(async () => {
    await organizationsQuery.refetch();
  }, [organizationsQuery.refetch]);

  const refreshActiveOrganization = useCallback(async () => {
    if (!selectedOrganizationId) {
      return;
    }

    await activeOrganizationQuery.refetch();
  }, [activeOrganizationQuery.refetch, selectedOrganizationId]);

  const onOrganizationCreated = useCallback(
    (newOrganization: OrganizationSelection) => {
      setSelectedOrganizationId(newOrganization.id);
    },
    [],
  );

  useEffect(() => {
    if (!session?.user || loading) {
      return;
    }

    if (organizations.length === 0) {
      router.push("/onboarding");
    }
  }, [loading, organizations.length, router, session?.user]);

  useEffect(() => {
    if (!userId) {
      setSelectedOrganizationId(null);
    }
  }, [userId]);

  useEffect(() => {
    const activeProfileOrganizationId =
      activeProfile?.userOrganization?.organization?.id;

    if (!activeProfileOrganizationId || organizations.length === 0) {
      return;
    }

    const matchingOrganization = organizations.find(
      (organization) => organization.id === activeProfileOrganizationId,
    );

    if (
      matchingOrganization &&
      selectedOrganizationId !== matchingOrganization.id
    ) {
      setSelectedOrganizationId(matchingOrganization.id);
    }
  }, [
    activeProfile?.userOrganization?.organization?.id,
    organizations,
    selectedOrganizationId,
  ]);

  useEffect(() => {
    if (organizations.length === 0) {
      return;
    }

    if (selectedOrganizationId) {
      const selectedOrganizationExists = organizations.some(
        (organization) => organization.id === selectedOrganizationId,
      );

      if (!selectedOrganizationExists) {
        setSelectedOrganizationId(organizations[0]?.id ?? null);
      }

      return;
    }

    const savedOrganizationId = localStorage.getItem("selectedOrganizationId");

    if (savedOrganizationId) {
      const savedOrganization = organizations.find(
        (organization) => organization.id === savedOrganizationId,
      );

      if (savedOrganization) {
        setSelectedOrganizationId(savedOrganization.id);
        return;
      }
    }

    setSelectedOrganizationId(organizations[0]?.id ?? null);
  }, [organizations, selectedOrganizationId]);

  useEffect(() => {
    if (!selectedOrganizationId) {
      localStorage.removeItem("selectedOrganizationId");
      return;
    }

    localStorage.setItem("selectedOrganizationId", selectedOrganizationId);
  }, [selectedOrganizationId]);

  const value: OrganizationContextType = {
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
