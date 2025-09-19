'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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

  const fetchConvites = async () => {
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
  };

  const refreshConvites = async () => {
    await fetchConvites();
  };

  const aceitarConvite = async (tokenInvite: string, aceitoPor: string): Promise<boolean> => {
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
  };

  const rejeitarConvite = async (conviteId: string): Promise<boolean> => {
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
  };

  // Buscar convites quando a organização mudar
  useEffect(() => {
    if (selectedOrganization?.id) {
      fetchConvites();
    }
  }, [selectedOrganization?.id]);

  // Atualizar a cada 5 minutos
  useEffect(() => {
    if (!selectedOrganization?.id) return;

    const interval = setInterval(fetchConvites, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [selectedOrganization?.id]);

  useEffect(() => {
      fetchConvites();
  }, [user?.email]);

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
