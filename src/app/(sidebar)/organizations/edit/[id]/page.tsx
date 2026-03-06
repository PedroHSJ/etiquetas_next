"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationSettings } from "@/components/organization";
import { WriteGuard } from "@/components/auth/PermissionGuard";
import { useOrganization } from "@/contexts/OrganizationContext";
import { OrganizationService } from "@/lib/services/client/organization-service";
import type { Organization } from "@/types/models/organization";
import { toast } from "sonner";

interface EditOrganizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditOrganizationPage({
  params,
}: EditOrganizationPageProps) {
  const router = useRouter();
  const { refetchOrganizations } = useOrganization();
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadOrganization = async () => {
      try {
        const resolved = await params;
        const org = await OrganizationService.getOrganizationByIdExpanded(
          resolved.id,
        );

        if (!isMounted) return;
        setOrganization(org as unknown as Organization);
      } catch (error) {
        toast.error("Nao foi possivel carregar a organizacao para edicao.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadOrganization();

    return () => {
      isMounted = false;
    };
  }, [params]);

  const handleUpdated = async () => {
    await refetchOrganizations();
    toast.success("Organizacao atualizada com sucesso!");
    router.push("/organizations/list");
  };

  return (
    <WriteGuard module="ORGANIZATIONS">
      {loading ? (
        <div className="p-6">Carregando...</div>
      ) : organization ? (
        <OrganizationSettings
          organization={organization}
          onUpdate={() => {
            handleUpdated();
          }}
        />
      ) : (
        <div className="p-6">Organizacao nao encontrada.</div>
      )}
    </WriteGuard>
  );
}
