"use client";

import React, { useState } from "react";
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
import { InviteManager } from "./InviteManager";
import { Invite } from "@/types/models/invite";
// import { cn } from "@/lib/utils";

export const NotificationBell: React.FC = () => {
  const {
    // acceptInvite,
    // rejectInvite,
    // refreshInvites,
    pendingInvites,
    pendingInviteCount,
    isLoading,
  } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState<Invite | null>(null);

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

  const handleInviteClick = (invite: Invite) => {
    setSelectedInvite(invite);
    setIsOpen(false); // Fechar o popover de notificações
  };

  const handleCloseInviteManager = () => {
    setSelectedInvite(null);
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
            {pendingInviteCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
              >
                {pendingInviteCount > 99 ? "99+" : pendingInviteCount}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-80 p-0" align="end">
          <div className="flex items-center justify-between p-4 border-b">
            <h4 className="font-semibold">Convites Pendentes</h4>
            <Badge variant="secondary">
              {pendingInviteCount}{" "}
              {pendingInviteCount === 1 ? "convite" : "convites"}
            </Badge>
          </div>

          <ScrollArea className="h-max">
            {isLoading ? (
              <div className="p-4 text-center text-muted-foreground">
                Carregando...
              </div>
            ) : pendingInvites.length === 0 ? (
              <div className="p-4 text-center text-muted-foreground">
                Nenhum convite pendente
              </div>
            ) : (
              <div className="p-2">
                {pendingInvites?.map((invite, index) => {
                  const isExpired = new Date(invite.expiresAt) < new Date();

                  return (
                    <div key={invite.id}>
                      <div
                        className="p-3 rounded-lg hover:bg-accent cursor-pointer transition-colors"
                        onClick={() => handleInviteClick(invite)}
                      >
                        {invite.email.length > 25 ? (
                          <div className="space-y-2">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground break-all">
                                {invite.email}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Perfil: {invite.profile?.name || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                {formatDate(invite.createdAt.toString())}
                              </p>
                            </div>
                            <div className="flex justify-end">
                              <Badge
                                variant={isExpired ? "destructive" : "outline"}
                                className="text-xs"
                              >
                                {invite.status == "pending"
                                  ? "Pendente"
                                  : invite.status}
                              </Badge>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-foreground truncate">
                                {invite.email}
                              </p>
                              <p className="text-xs text-muted-foreground mt-1">
                                Perfil: {invite.profile?.name || "N/A"}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(invite.createdAt.toString())}
                              </p>
                            </div>
                            <div className="ml-2 text-right">
                              <Badge variant="destructive" className="text-xs">
                                {invite.status == "pending"
                                  ? "Pendente"
                                  : invite.status}
                              </Badge>
                            </div>
                          </div>
                        )}
                      </div>
                      {index < pendingInvites.length - 1 && (
                        <Separator className="my-2" />
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </ScrollArea>

          {pendingInvites.length > 0 && (
            <div className="p-3 border-t bg-muted/50">
              <p className="text-xs text-muted-foreground text-center">
                Clique em um convite para gerenciá-lo
              </p>
            </div>
          )}
        </PopoverContent>
      </Popover>

      {/* Modal para gerenciar convite */}
      <Dialog
        open={!!selectedInvite}
        onOpenChange={() => setSelectedInvite(null)}
      >
        <DialogContent className="" showCloseButton={false}>
          {selectedInvite && (
            <InviteManager
              invite={selectedInvite}
              onClose={handleCloseInviteManager}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
