"use client";
import { OrganizationWizard } from "@/components/wizard/OrganizationWizard";
import { useRouter } from "next/navigation";
import { Suspense } from "react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { useProfile } from "@/contexts/ProfileContext";
import { useQueryClient } from "@tanstack/react-query";
import { USER_PROFILES_QUERY_KEY } from "@/hooks/useUserProfilesQuery";
import { WriteGuard } from "@/components/auth/PermissionGuard";

export default function Page() {
  const { userId } = useAuth();
  const { refetchOrganizations } = useOrganization();
  const { refreshProfiles } = useProfile();
  const router = useRouter();
  const queryClient = useQueryClient();

  const handleWizardComplete = async () => {
    try {
      // Invalidar todas as queries relacionadas
      await queryClient.invalidateQueries({ queryKey: ["organizations"] });
      await queryClient.invalidateQueries({
        queryKey: USER_PROFILES_QUERY_KEY,
      });

      // Recarregar as organizações para atualizar o TeamSwitcher
      await refetchOrganizations();

      // Refresh dos perfis no contexto também
      await refreshProfiles();

      toast.success("Organização criada com sucesso!");

      // Usar router.push em vez de redirect para melhor UX
      router.push("/organizations/list");
    } catch (error) {
      toast.error(
        `Não foi possível criar a organização: ${
          error instanceof Error ? error.message : "Erro desconhecido"
        }`,
      );
    }
  };

  return (
    <WriteGuard module="ORGANIZATIONS">
      <Suspense
        fallback={
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
              <div className="bg-muted/50 aspect-video rounded-xl" />
            </div>
            <div className="bg-muted/50 min-h-[100vh] flex-1 rounded-xl md:min-h-min" />
          </div>
        }
      >
        <OrganizationWizard userId={userId} onComplete={handleWizardComplete} />
      </Suspense>
    </WriteGuard>
  );
}
