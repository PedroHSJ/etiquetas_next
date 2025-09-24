"use client";

import { OrganizationWizard } from "@/components/wizard/OrganizationWizard";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";

interface EditOrganizationPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function EditOrganizationPage({ params }: EditOrganizationPageProps) {
  const { userId } = useAuth();
  const { refetchOrganizations, onOrganizationCreated } = useOrganization();
  const router = useRouter();

  const handleWizardComplete = async () => {
    try {
      // Recarregar as organizações para atualizar o TeamSwitcher
      await refetchOrganizations();
      toast.success("Organização criada com sucesso!");

      // Usar router.push em vez de redirect para melhor UX
      router.push("/dashboard");
    } catch (error) {
      console.error("Erro ao recarregar organizações:", error);
      // Mesmo assim mostrar sucesso e redirecionar
      toast.success("Organização criada com sucesso!");
      router.push("/dashboard");
    }
  };
  
  return (
          <PermissionGuard funcionalidade="Organizações" acao="editar">
      <OrganizationWizard userId={userId} onComplete={() => {
        handleWizardComplete();
      }} />
    </PermissionGuard>
  );
}
