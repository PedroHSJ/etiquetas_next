"use client";

import React, {
  createContext,
  useContext,
  ReactNode,
  useCallback,
} from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useOrganization } from "./OrganizationContext";
import { InviteService } from "@/lib/services/inviteService";
import { useAuth } from "./AuthContext";
import { Invite } from "@/types/models/invite";

interface NotificationContextType {
  pendingInvites: Invite[];
  pendingInviteCount: number;
  isLoading: boolean;
  refreshInvites: () => Promise<void>;
  acceptInvite: (tokenInvite: string, acceptedBy: string) => Promise<boolean>;
  rejectInvite: (inviteId: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotifications deve ser usado dentro de um NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const { selectedOrganization } = useOrganization();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Query para buscar convites pendentes
  const {
    data: pendingInvites = [],
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["pending-invites", user?.email, selectedOrganization?.id],
    queryFn: async () => {
      if (!user?.email) return [];
      return await InviteService.getPendingInvites();
    },
    enabled: !!user?.email,
    refetchInterval: 5 * 60 * 1000, // Atualizar a cada 5 minutos
    staleTime: 2 * 60 * 1000, // Considerar dados frescos por 2 minutos
  });

  // Mutation para aceitar convite
  const acceptMutation = useMutation({
    mutationFn: async (tokenInvite: string) => {
      return await InviteService.acceptInvite(tokenInvite);
    },
    onSuccess: () => {
      // Invalidar a query de convites pendentes para recarregar
      queryClient.invalidateQueries({
        queryKey: ["pending-invites", user?.email],
      });
    },
  });

  // Mutation para rejeitar convite
  const rejectMutation = useMutation({
    mutationFn: async (inviteId: string) => {
      return await InviteService.rejectInvite(inviteId);
    },
    onSuccess: () => {
      // Invalidar a query de convites pendentes para recarregar
      queryClient.invalidateQueries({
        queryKey: ["pending-invites", user?.email, selectedOrganization?.id],
      });
    },
  });

  const refreshInvites = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const acceptInvite = useCallback(
    async (tokenInvite: string, _aceitoPor: string): Promise<boolean> => {
      try {
        await acceptMutation.mutateAsync(tokenInvite);
        return true;
      } catch (error) {
        console.error("Erro ao aceitar convite:", error);
        return false;
      }
    },
    [acceptMutation]
  );

  const rejectInvite = useCallback(
    async (inviteId: string): Promise<boolean> => {
      try {
        await rejectMutation.mutateAsync(inviteId);
        return true;
      } catch (error) {
        console.error("Erro ao cancelar convite:", error);
        return false;
      }
    },
    [rejectMutation]
  );

  const value: NotificationContextType = {
    pendingInvites,
    pendingInviteCount: pendingInvites.length,
    isLoading,
    refreshInvites,
    acceptInvite,
    rejectInvite,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
