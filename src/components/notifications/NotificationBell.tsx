"use client";

import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { useNotifications } from "@/contexts/NotificationContext";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { ScrollArea } from "../ui/scroll-area";
import { Separator } from "../ui/separator";
import { Dialog, DialogContent } from "../ui/dialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ConviteManager } from "./ConviteManager";
import { ConvidadoPor } from "../onboarding/ConvidadoPor";
import { Convite } from "@/types/onboarding";

export const NotificationBell: React.FC = () => {
  const { convitesPendentes, contagemConvites, isLoading } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedConvite, setSelectedConvite] = useState<Convite | null>(null);

  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  const handleConviteClick = (convite: Convite) => {
    setSelectedConvite(convite);
    setIsOpen(false); // Fechar o popover de notificações
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
                className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full p-0 text-xs"
              >
                {contagemConvites > 99 ? "99+" : contagemConvites}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between border-b p-4">
            <h4 className="font-semibold">Convites Pendentes</h4>
            <Badge variant="secondary">
              {contagemConvites} {contagemConvites === 1 ? "convite" : "convites"}
            </Badge>
          </div>

          <ScrollArea className="h-80">
            {isLoading ? (
              <div className="text-muted-foreground p-4 text-center">Carregando...</div>
            ) : convitesPendentes.length === 0 ? (
              <div className="text-muted-foreground p-4 text-center">Nenhum convite pendente</div>
            ) : (
              <div className="p-2">
                {convitesPendentes.map((convite, index) => (
                  <div key={convite.id}>
                    <div
                      className="hover:bg-accent cursor-pointer rounded-lg p-3 transition-colors"
                      onClick={() => handleConviteClick(convite)}
                    >
                      {convite.email.length > 25 ? (
                        // Layout para emails longos - badge na parte inferior
                        <div className="space-y-2">
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground text-sm font-medium break-all">
                              {convite.email}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Perfil: {convite.perfil?.nome || "N/A"}
                            </p>
                            <div className="mt-1">
                              <ConvidadoPor
                                usuario={convite.convidado_por_usuario}
                                isLoading={isLoading}
                                compact={true}
                              />
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {formatDate(convite.created_at)}
                            </p>
                          </div>
                          <div className="flex justify-end">
                            <Badge variant="outline" className="text-xs">
                              {convite.status}
                            </Badge>
                          </div>
                        </div>
                      ) : (
                        // Layout padrão para emails normais - badge à direita
                        <div className="flex items-start justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-foreground truncate text-sm font-medium">
                              {convite.email}
                            </p>
                            <p className="text-muted-foreground mt-1 text-xs">
                              Perfil: {convite.perfil?.nome || "N/A"}
                            </p>
                            <div className="mt-1">
                              <ConvidadoPor
                                usuario={convite.convidado_por_usuario}
                                isLoading={isLoading}
                                compact={true}
                              />
                            </div>
                            <p className="text-muted-foreground text-xs">
                              {formatDate(convite.created_at)}
                            </p>
                          </div>
                          <div className="ml-2 text-right">
                            <Badge variant="outline" className="text-xs">
                              {convite.status}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                    {index < convitesPendentes.length - 1 && <Separator className="my-2" />}
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {convitesPendentes.length > 0 && (
            <div className="bg-muted/50 border-t p-3">
              <p className="text-muted-foreground text-center text-xs">
                Clique em um convite para gerenciá-lo
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Modal para gerenciar convite */}
      <Dialog open={!!selectedConvite} onOpenChange={() => setSelectedConvite(null)}>
        <DialogContent className="" showCloseButton={false}>
          {selectedConvite && (
            <ConviteManager convite={selectedConvite} onClose={handleCloseConviteManager} />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
