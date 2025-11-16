"use client";

import React, { useState } from "react";
import { useNotifications } from "../../contexts/NotificationContext";
import { Convite } from "../../types/onboarding";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Separator } from "../ui/separator";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Check, X, Clock, User, Mail, Shield } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "../../contexts/AuthContext";
import { Invite } from "@/types/models/invite";

interface InviteManagerProps {
  invite: Invite;
  onClose: () => void;
}

export const InviteManager: React.FC<InviteManagerProps> = ({
  invite,
  onClose,
}) => {
  const { acceptInvite, rejectInvite } = useNotifications();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

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

  const formatExpiration = (dateString: string) => {
    try {
      const expiraEm = new Date(dateString);
      const agora = new Date();
      const diffMs = expiraEm.getTime() - agora.getTime();
      const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

      if (diffDays <= 0) return "Expirado";
      if (diffDays === 1) return "Expira amanhã";
      return `Expira em ${diffDays} dias`;
    } catch {
      return "Data inválida";
    }
  };

  const handleAcceptInvite = async () => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsLoading(true);
    try {
      const success = await acceptInvite(invite.inviteToken, user.id);
      if (success) {
        toast.success("Convite aceito com sucesso!");
        onClose();
      } else {
        toast.error("Não foi possível aceitar o convite");
      }
    } catch (error) {
      toast.error("Erro ao aceitar convite");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectInvite = async () => {
    setIsLoading(true);
    try {
      const success = await rejectInvite(invite.id);
      if (success) {
        toast.success("Convite rejeitado com sucesso!");
        onClose();
      } else {
        toast.error("Não foi possível rejeitar o convite");
      }
    } catch (error) {
      toast.error("Erro ao cancelar convite");
    } finally {
      setIsLoading(false);
    }
  };

  const isExpired = new Date(invite.expiresAt) < new Date();

  return (
    <div className="w-full max-w-md">
      <div className="pb-3">
        <div className="flex items-center gap-2 text-lg">
          <Mail className="h-5 w-5" />
          Gerenciar Convite
        </div>
      </div>

      <div className="space-y-4">
        {/* Informações do convite */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium">{invite.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              Perfil: {invite.profile?.name || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {formatDate(invite.createdAt.toString())}
            </span>
          </div>
        </div>

        <Separator />

        {/* Status e expiração */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge
              variant={isExpired ? "destructive" : "outline"}
              className="text-xs"
            >
              {invite.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expiração:</span>
            <span
              className={`text-xs ${
                isExpired ? "text-destructive" : "text-muted-foreground"
              }`}
            >
              {formatExpiration(invite.expiresAt.toString())}
            </span>
          </div>
        </div>

        <Separator />

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAcceptInvite}
            disabled={isLoading || isExpired}
            className="flex-1"
            size="sm"
          >
            <Check className="h-4 w-4 mr-2" />
            Aceitar
          </Button>

          <Button
            onClick={handleRejectInvite}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <X className="h-4 w-4 mr-2" />
            Rejeitar
          </Button>
        </div>

        {isExpired && (
          <div className="text-xs text-destructive text-center bg-destructive/10 p-2 rounded">
            Este convite expirou e não pode mais ser aceito
          </div>
        )}
      </div>
    </div>
  );
};
