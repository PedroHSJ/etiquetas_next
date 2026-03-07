"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { OrganizationSettings } from "@/components/organization";
import { WriteGuard } from "@/components/auth/PermissionGuard";
import { useOrganizationExpandedQuery } from "@/hooks/useOrganizationsQuery";
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
  const [organizationId, setOrganizationId] = useState("");

  useEffect(() => {
    let isMounted = true;

    const resolveOrganizationId = async () => {
      try {
        const resolved = await params;
        if (!isMounted) return;
        setOrganizationId(resolved.id);
      } catch (error) {
        toast.error("Nao foi possivel carregar a organizacao para edicao.");
      }
    };

    void resolveOrganizationId();

    return () => {
      isMounted = false;
    };
  }, [params]);

  const {
    data: organization,
    isLoading,
  } = useOrganizationExpandedQuery(organizationId);

  const handleUpdated = () => {
    router.push("/organizations/list");
  };

  return (
    <WriteGuard module="ORGANIZATIONS">
      {isLoading || !organizationId ? (
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
