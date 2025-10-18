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

interface ConviteManagerProps {
  convite: Convite;
  onClose: () => void;
}

export const ConviteManager: React.FC<ConviteManagerProps> = ({ convite, onClose }) => {
  const { aceitarConvite, rejeitarConvite } = useNotifications();
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

  const handleAceitarConvite = async () => {
    if (!user?.id) {
      toast.error("Usuário não autenticado");
      return;
    }

    setIsLoading(true);
    try {
      const success = await aceitarConvite(convite.token_invite, user.id);
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

  const handleRejeitarConvite = async () => {
    setIsLoading(true);
    try {
      const success = await rejeitarConvite(convite.id);
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

  const isExpired = new Date(convite.expira_em) < new Date();

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
            <User className="text-muted-foreground h-4 w-4" />
            <span className="text-sm font-medium">{convite.email}</span>
          </div>

          <div className="flex items-center gap-2">
            <Shield className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">
              Perfil: {convite.perfil?.nome || "N/A"}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Clock className="text-muted-foreground h-4 w-4" />
            <span className="text-muted-foreground text-sm">{formatDate(convite.created_at)}</span>
          </div>
        </div>

        <Separator />

        {/* Status e expiração */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={isExpired ? "destructive" : "outline"} className="text-xs">
              {convite.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Expiração:</span>
            <span className={`text-xs ${isExpired ? "text-destructive" : "text-muted-foreground"}`}>
              {formatExpiration(convite.expira_em)}
            </span>
          </div>
        </div>

        <Separator />

        {/* Ações */}
        <div className="flex gap-2 pt-2">
          <Button
            onClick={handleAceitarConvite}
            disabled={isLoading || isExpired}
            className="flex-1"
            size="sm"
          >
            <Check className="mr-2 h-4 w-4" />
            Aceitar
          </Button>

          <Button
            onClick={handleRejeitarConvite}
            disabled={isLoading}
            variant="outline"
            className="flex-1"
            size="sm"
          >
            <X className="mr-2 h-4 w-4" />
            Rejeitar
          </Button>
        </div>

        {isExpired && (
          <div className="text-destructive bg-destructive/10 rounded p-2 text-center text-xs">
            Este convite expirou e não pode mais ser aceito
          </div>
        )}
      </div>
    </div>
  );
};
