import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { InviteService } from "@/lib/services/inviteService";
import { Convite } from "@/types/onboarding";

export const useOnboarding = () => {
  const { user } = useAuth();
  const [invites, setInvites] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasOrganization, setHasOrganization] = useState(false);

  useEffect(() => {
    if (user?.email) {
      checkUserStatus();
    }
  }, [user]);

  const checkUserStatus = async () => {
    try {
      setLoading(true);

      // Verificar se usuário já está em uma organização
      if (user?.id) {
        const isInOrganization = await InviteService.checkUserOrganization(user.id);
        setHasOrganization(isInOrganization);
      }

      // Carregar convites pendentes
      const pendingInvites = await InviteService.getPendingInvites(user!.email!);
      setInvites(pendingInvites);
    } catch (error) {
      console.error("Erro ao verificar status do usuário:", error);
    } finally {
      setLoading(false);
    }
  };

  const refreshInvites = async () => {
    if (user?.email) {
      try {
        const pendingInvites = await InviteService.getPendingInvites(user.email);
        setInvites(pendingInvites);
      } catch (error) {
        console.error("Erro ao atualizar convites:", error);
      }
    }
  };

  const removeInvite = (inviteId: string) => {
    setInvites((prev) => prev.filter((inv) => inv.id !== inviteId));
  };

  return {
    invites,
    loading,
    hasOrganization,
    refreshInvites,
    removeInvite,
    checkUserStatus,
  };
};
