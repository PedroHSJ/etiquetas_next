'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { Convite } from '../types/onboarding';
import { useOrganization } from './OrganizationContext';
import { InviteService } from "@/lib/services/inviteService";
import { useAuth } from './AuthContext';

interface NotificationContextType {
  convitesPendentes: Convite[];
  contagemConvites: number;
  isLoading: boolean;
  refreshConvites: () => Promise<void>;
  aceitarConvite: (tokenInvite: string, aceitoPor: string) => Promise<boolean>;
  rejeitarConvite: (conviteId: string) => Promise<boolean>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications deve ser usado dentro de um NotificationProvider');
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({ children }) => {
  const { selectedOrganization } = useOrganization();
  const [convitesPendentes, setConvitesPendentes] = useState<Convite[]>([]);
  const [contagemConvites, setContagemConvites] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuth();

  const fetchConvites = useCallback(async () => {
    if (!user?.email) return;
    setIsLoading(true);
    try {
      const convites = await InviteService.getConvitesByStatus('pendente', user?.email);
      setConvitesPendentes(convites);
      setContagemConvites(convites.length);
    } catch (error) {
      console.error('Erro ao buscar convites:', error);
    } finally {
      setIsLoading(false);
    }
  }, [user?.email]);

  const refreshConvites = useCallback(async () => {
    await fetchConvites();
  }, [fetchConvites]);

  const aceitarConvite = useCallback(async (tokenInvite: string, aceitoPor: string): Promise<boolean> => {
    try {
      const success = await InviteService.acceptInvite(tokenInvite, aceitoPor);
      if (success) {
        await refreshConvites();
      }
      return success;
    } catch (error) {
      console.error('Erro ao aceitar convite:', error);
      return false;
    }
  }, [refreshConvites]);

  const rejeitarConvite = useCallback(async (conviteId: string): Promise<boolean> => {
    try {
      const success = await InviteService.rejeitarConvite(conviteId);
      if (success) {
        await refreshConvites();
      }
      return success;
    } catch (error) {
      console.error('Erro ao cancelar convite:', error);
      return false;
    }
  }, [refreshConvites]);

  // Buscar convites quando a organização ou usuário mudar
  useEffect(() => {
    if (user?.email) {
      fetchConvites();
    }
  }, [selectedOrganization?.id, user?.email, fetchConvites]);

  // Atualizar a cada 5 minutos
  useEffect(() => {
    if (!user?.email) return;

    const interval = setInterval(fetchConvites, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user?.email, fetchConvites]);

  const value: NotificationContextType = {
    convitesPendentes,
    contagemConvites,
    isLoading,
    refreshConvites,
    aceitarConvite,
    rejeitarConvite,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
