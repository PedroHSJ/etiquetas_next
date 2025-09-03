'use client';

import React, { useState } from 'react';
import { Bell } from 'lucide-react';
import { useNotifications } from '@/contexts/NotificationContext';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '../ui/popover';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ConviteManager } from './ConviteManager';
import { ConviteWithDetails } from '../../types';

export const NotificationBell: React.FC = () => {
  const { convitesPendentes, contagemConvites, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConvite, setSelectedConvite] = useState<ConviteWithDetails | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { 
        addSuffix: true, 
        locale: ptBR 
      });
    } catch {
      return 'Data inválida';
    }
  };

  const handleConviteClick = (convite: ConviteWithDetails) => {
    setSelectedConvite(convite);
  };

  const handleCloseConviteManager = () => {
    setSelectedConvite(null);
  };

  return (
    <>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="relative h-9 w-9 rounded-md"
            aria-label="Notificações"
          >
            <Bell className="h-5 w-5" />
            {contagemConvites > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {contagemConvites > 99 ? '99+' : contagemConvites}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-semibold">Convites Pendentes</h4>
            <Badge variant="secondary">
              {contagemConvites} {contagemConvites === 1 ? 'convite' : 'convites'}
            </Badge>
          </div>
          
          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : convitesPendentes.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum convite pendente
              </div>
            ) : (
              <div className="p-2">
                {convitesPendentes.map((convite, index) => (
                  <div key={convite.id}>
                    <div
                      className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                      onClick={() => handleConviteClick(convite)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {convite.email}
                          </p>
                          <p className="text-xs text-muted-foreground mt-1">
                            Perfil: {convite.perfil_nome || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Convidado por: {convite.convidado_por_nome || 'N/A'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {formatDate(convite.created_at)}
                          </p>
                        </div>
                        <div className="ml-2 text-right">
                          <Badge variant="outline" className="text-xs">
                            {convite.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                    {index < convitesPendentes.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>
          
          {convitesPendentes.length > 0 && (
            <div className="p-3 border-t bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                Clique em um convite para gerenciá-lo
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Modal para gerenciar convite */}
      {selectedConvite && (
        <Popover open={!!selectedConvite} onOpenChange={() => setSelectedConvite(null)}>
          <PopoverContent className="w-96 p-0" align="center">
            <ConviteManager 
              convite={selectedConvite} 
              onClose={handleCloseConviteManager} 
            />
          </PopoverContent>
        </Popover>
      )}
    </>
  );
};
