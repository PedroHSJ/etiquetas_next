"use client";

import { useState, useEffect, Suspense } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/ui/navigation-button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Mail,
  Plus,
  User,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { InviteService } from "@/lib/services/inviteService";
import { Convite } from "@/types/onboarding";
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import { toast } from "sonner";
import FilterBar from "@/components/filters/FilterBar";
import Pagination from "@/components/pagination/Pagination";

export default function ConvitesPage() {
  const { userId, user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const organizacaoId = selectedOrganization?.id;
  const organizacaoNome = selectedOrganization?.nome || "";
  const [convites, setConvites] = useState<Convite[]>([]);
  const [convitesPendentes, setConvitesPendentes] = useState<Convite[]>([]);
  const [convitesAceitos, setConvitesAceitos] = useState<Convite[]>([]);
  const [convitesRejeitados, setConvitesRejeitados] = useState<Convite[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("pendentes");

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Dialog de confirmação de ações
  const [actionDialog, setActionDialog] = useState({
    isOpen: false,
    convite: null as Convite | null,
    action: "" as "aceitar" | "rejeitar" | "cancelar",
    isProcessing: false,
  });

  const fetchConvites = async () => {
    if (!organizacaoId) return;

    setLoading(true);
    try {
      const allConvites = await InviteService.getConvitesByEmail(
        user?.email || ""
      );
      setConvites(allConvites);

      // Separar por status
      setConvitesPendentes(allConvites.filter((c) => c.status === "pendente"));
      setConvitesAceitos(allConvites.filter((c) => c.status === "aceito"));
      setConvitesRejeitados(
        allConvites.filter((c) => c.status === "rejeitado")
      );
    } catch (error) {
      console.error("Erro ao buscar convites:", error);
      toast.error("Erro ao carregar convites");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizacaoId) {
      fetchConvites();
    }
  }, [organizacaoId]);

  const handleAceitarConvite = async (convite: Convite) => {
    if (!userId) return;

    setActionDialog({
      isOpen: true,
      convite,
      action: "aceitar",
      isProcessing: false,
    });
  };

  const handleRejeitarConvite = async (convite: Convite) => {
    if (!userId) return;

    setActionDialog({
      isOpen: true,
      convite,
      action: "rejeitar",
      isProcessing: false,
    });
  };

  const handleCancelarConvite = async (convite: Convite) => {
    setActionDialog({
      isOpen: true,
      convite,
      action: "cancelar",
      isProcessing: false,
    });
  };

  const confirmAction = async () => {
    if (!actionDialog.convite || !userId) return;

    setActionDialog((prev) => ({ ...prev, isProcessing: true }));

    try {
      switch (actionDialog.action) {
        case "aceitar":
          await InviteService.aceitarConvite(actionDialog.convite.id, userId);
          toast.success("Convite aceito com sucesso!");
          break;
        case "rejeitar":
          await InviteService.rejeitarConvite(actionDialog.convite.id, userId);
          toast.success("Convite rejeitado");
          break;
        case "cancelar":
          await InviteService.cancelarConvite(actionDialog.convite.id);
          toast.success("Convite cancelado");
          break;
      }

      // Recarregar convites
      await fetchConvites();
      closeActionDialog();
    } catch (error) {
      console.error("Erro ao processar ação:", error);
      toast.error("Erro ao processar ação");
      setActionDialog((prev) => ({ ...prev, isProcessing: false }));
    }
  };

  const closeActionDialog = () => {
    setActionDialog({
      isOpen: false,
      convite: null,
      action: "aceitar",
      isProcessing: false,
    });
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const getStatusBadge = (status: Convite["status"]) => {
    const statusInfo = InviteService.getStatusInfo(status);
    return (
      <Badge variant={statusInfo.variant as "default" | "secondary" | "destructive" | "outline"} className={statusInfo.color}>
        {statusInfo.label}
      </Badge>
    );
  };

  const renderConvitesTable = (
    convitesList: Convite[],
    showActions: boolean = false
  ) => {
    if (convitesList.length === 0) {
      return (
        <div className="text-center py-8 text-muted-foreground">
          Nenhum convite encontrado
        </div>
      );
    }

    return (
      <div className="space-y-4">
        {/* Visualização em Cards para mobile */}
        <div className="block md:hidden space-y-4">
          {convitesList.map((convite) => (
            <Card key={convite.id} className="overflow-hidden">
              <CardContent className="p-0">
                {/* Header do Card */}
                <div className="p-4 pb-3 border-b border-border/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-blue-100 text-blue-600 text-sm">
                            {getInitials(convite.email.split("@")[0])}
                          </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-base truncate">
                            {convite.email}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {convite.perfil?.nome} • {convite.organizacao?.nome}
                          </p>
                        </div>
                      </div>

                      {/* Informações do convite */}
                      <div className="space-y-1">
                        <p className="text-xs text-muted-foreground">
                          Enviado em{" "}
                          {format(new Date(convite.created_at), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expira em{" "}
                          {format(new Date(convite.expira_em), "dd/MM/yyyy", {
                            locale: ptBR,
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="ml-2">{getStatusBadge(convite.status)}</div>
                  </div>
                </div>

                {/* Footer do Card com informações de quem convidou */}
                <div className="p-4 pt-3 bg-muted/30">
                  {convite.convidado_por_usuario && (
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="h-8 w-8 text-xs bg-gray-100 text-gray-600">
                          {getInitials(convite.convidado_por_usuario.nome)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-muted-foreground">
                          Convidado por {convite.convidado_por_usuario.nome}
                        </p>
                        <p className="text-xs text-muted-foreground truncate">
                          {convite.convidado_por_usuario.email}
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Ações para convites pendentes */}
                  {showActions && convite.status === "pendente" && (
                    <div className="flex gap-2 mt-3 pt-3 border-t border-border/50">
                      <Button
                        size="sm"
                        onClick={() => handleAceitarConvite(convite)}
                        className="flex-1 h-10"
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Aceitar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleRejeitarConvite(convite)}
                        className="flex-1 h-10"
                      >
                        <XCircle className="h-4 w-4 mr-2" />
                        Rejeitar
                      </Button>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Visualização em Tabela para desktop */}
        <div className="hidden md:block">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Perfil</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Convidado por</TableHead>
                <TableHead>Enviado em</TableHead>
                <TableHead>Expira em</TableHead>
                {showActions && (
                  <TableHead className="text-right">Ações</TableHead>
                )}
              </TableRow>
            </TableHeader>
            <TableBody>
              {convitesList.map((convite) => (
                <TableRow key={convite.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{convite.perfil?.nome}</div>
                      <div className="text-xs text-muted-foreground">
                        {convite.perfil?.descricao}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(convite.status)}</TableCell>
                  <TableCell>
                    {convite.convidado_por_usuario ? (
                      <div className="flex items-center gap-2">
                        <Avatar className="h-6 w-6">
                            <AvatarFallback className="h-6 w-6 text-xs bg-gray-100 text-gray-600">
                              {getInitials(convite.convidado_por_usuario.nome)}
                            </AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="text-sm font-medium">
                            {convite.convidado_por_usuario.nome}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {convite.convidado_por_usuario.email}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">N/A</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(convite.created_at), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {format(new Date(convite.expira_em), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </div>
                  </TableCell>
                  {showActions && (
                    <TableCell className="text-right">
                      {convite.status === "pendente" && (
                        <div className="flex gap-1 justify-end">
                          <Button
                            size="sm"
                            onClick={() => handleAceitarConvite(convite)}
                            className="h-8 px-2"
                          >
                            <CheckCircle className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleRejeitarConvite(convite)}
                            className="h-8 px-2"
                          >
                            <XCircle className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  };

  if (!organizacaoId) {
    return (
      <div className="flex flex-1 flex-col gap-6">
        <div className="text-center py-8">
          <h1 className="text-2xl font-bold">Convites</h1>
          <p className="text-muted-foreground">
            Você precisa ter uma organização ativa para gerenciar convites.
          </p>
        </div>
      </div>
    );
  }

  return (
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
      <PermissionGuard funcionalidade="Convites" acao="visualizar">
        <div className="flex flex-1 flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-3xl font-bold">Convites</h1>
                <p className="text-muted-foreground">
                  Gerencie convites para {organizacaoNome}
                </p>
              </div>
            </div>
            <NavigationButton href="/convites/create">
              <User className="mr-2 h-4 w-4" />
              Novo Convite
            </NavigationButton>
          </div>

          {/* Tabs */}
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            {/* Tabs para Desktop */}
            <TabsList className="hidden md:grid w-full grid-cols-4">
              <TabsTrigger
                value="pendentes"
                className="flex items-center gap-2"
              >
                <Mail className="h-4 w-4" />
                Pendentes ({convitesPendentes.length})
              </TabsTrigger>
              <TabsTrigger value="aceitos" className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4" />
                Aceitos ({convitesAceitos.length})
              </TabsTrigger>
              <TabsTrigger
                value="rejeitados"
                className="flex items-center gap-2"
              >
                <XCircle className="h-4 w-4" />
                Rejeitados ({convitesRejeitados.length})
              </TabsTrigger>
              <TabsTrigger value="todos" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Todos ({convites.length})
              </TabsTrigger>
            </TabsList>

            {/* Tabs para Mobile - Layout Vertical com Cards */}
            <div className="md:hidden space-y-3">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => setActiveTab("pendentes")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeTab === "pendentes"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Mail
                      className={`h-6 w-6 ${
                        activeTab === "pendentes"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Pendentes</div>
                      <div className="text-xs text-muted-foreground">
                        {convitesPendentes.length} convite(s)
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("aceitos")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeTab === "aceitos"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <CheckCircle
                      className={`h-6 w-6 ${
                        activeTab === "aceitos"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Aceitos</div>
                      <div className="text-xs text-muted-foreground">
                        {convitesAceitos.length} convite(s)
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("rejeitados")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeTab === "rejeitados"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <XCircle
                      className={`h-6 w-6 ${
                        activeTab === "rejeitados"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Rejeitados</div>
                      <div className="text-xs text-muted-foreground">
                        {convitesRejeitados.length} convite(s)
                      </div>
                    </div>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab("todos")}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    activeTab === "todos"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border bg-card hover:bg-accent/50"
                  }`}
                >
                  <div className="flex flex-col items-center gap-2">
                    <Mail
                      className={`h-6 w-6 ${
                        activeTab === "todos"
                          ? "text-primary"
                          : "text-muted-foreground"
                      }`}
                    />
                    <div className="text-center">
                      <div className="font-semibold text-sm">Todos</div>
                      <div className="text-xs text-muted-foreground">
                        {convites.length} convite(s)
                      </div>
                    </div>
                  </div>
                </button>
              </div>

              {/* Indicador de Tab Ativa para Mobile */}
              <div className="flex justify-center">
                <div className="flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full">
                  <div className="w-2 h-2 bg-primary rounded-full"></div>
                  <span className="text-sm font-medium text-primary">
                    {activeTab === "pendentes" && "Pendentes"}
                    {activeTab === "aceitos" && "Aceitos"}
                    {activeTab === "rejeitados" && "Rejeitados"}
                    {activeTab === "todos" && "Todos os Convites"}
                  </span>
                </div>
              </div>
            </div>

            <TabsContent value="pendentes" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Convites Pendentes ({convitesPendentes.length})
                  </CardTitle>
                  <CardDescription>
                    Convites aguardando resposta dos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">
                        Carregando convites...
                      </p>
                    </div>
                  ) : (
                    renderConvitesTable(convitesPendentes, true)
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="aceitos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" />
                    Convites Aceitos ({convitesAceitos.length})
                  </CardTitle>
                  <CardDescription>
                    Convites que foram aceitos pelos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">
                        Carregando convites...
                      </p>
                    </div>
                  ) : (
                    renderConvitesTable(convitesAceitos)
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="rejeitados" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <XCircle className="h-5 w-5" />
                    Convites Rejeitados ({convitesRejeitados.length})
                  </CardTitle>
                  <CardDescription>
                    Convites que foram rejeitados pelos usuários
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">
                        Carregando convites...
                      </p>
                    </div>
                  ) : (
                    renderConvitesTable(convitesRejeitados)
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="todos" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Todos os Convites ({convites.length})
                  </CardTitle>
                  <CardDescription>
                    Visão geral de todos os convites da organização
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {loading ? (
                    <div className="text-center py-8">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
                      <p className="mt-2 text-muted-foreground">
                        Carregando convites...
                      </p>
                    </div>
                  ) : (
                    renderConvitesTable(convites)
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Dialog de Confirmação */}
          <Dialog open={actionDialog.isOpen} onOpenChange={closeActionDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  {actionDialog.action === "aceitar" && (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  )}
                  {actionDialog.action === "rejeitar" && (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                  {actionDialog.action === "cancelar" && (
                    <AlertTriangle className="h-5 w-5 text-orange-500" />
                  )}
                  Confirmar{" "}
                  {actionDialog.action === "aceitar"
                    ? "Aceitação"
                    : actionDialog.action === "rejeitar"
                    ? "Rejeição"
                    : "Cancelamento"}
                </DialogTitle>
                <DialogDescription>
                  {actionDialog.action === "aceitar" &&
                    "Tem certeza que deseja aceitar este convite?"}
                  {actionDialog.action === "rejeitar" &&
                    "Tem certeza que deseja rejeitar este convite?"}
                  {actionDialog.action === "cancelar" &&
                    "Tem certeza que deseja cancelar este convite?"}
                </DialogDescription>
              </DialogHeader>

              {actionDialog.convite && (
                <div className="py-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-blue-100 text-blue-600">
                        {getInitials(actionDialog.convite.email.split("@")[0])}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">
                        {actionDialog.convite.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {actionDialog.convite.perfil?.nome} •{" "}
                        {actionDialog.convite.organizacao?.nome}
                      </p>
                      {actionDialog.convite.convidado_por_usuario && (
                        <div className="flex items-center gap-2 mt-1">
                          <Avatar className="h-4 w-4">
                              <AvatarFallback className="h-4 w-4 text-xs bg-gray-100 text-gray-600">
                                {getInitials(
                                  actionDialog.convite.convidado_por_usuario
                                    .nome
                                )}
                              </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">
                            Convidado por{" "}
                            {actionDialog.convite.convidado_por_usuario.nome}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={closeActionDialog}
                  disabled={actionDialog.isProcessing}
                >
                  Cancelar
                </Button>
                <Button
                  variant={
                    actionDialog.action === "aceitar"
                      ? "default"
                      : actionDialog.action === "rejeitar"
                      ? "destructive"
                      : "secondary"
                  }
                  onClick={confirmAction}
                  disabled={actionDialog.isProcessing}
                >
                  {actionDialog.isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Processando...
                    </>
                  ) : (
                    <>
                      {actionDialog.action === "aceitar" && (
                        <CheckCircle className="h-4 w-4 mr-2" />
                      )}
                      {actionDialog.action === "rejeitar" && (
                        <XCircle className="h-4 w-4 mr-2" />
                      )}
                      {actionDialog.action === "cancelar" && (
                        <AlertTriangle className="h-4 w-4 mr-2" />
                      )}
                      {actionDialog.action === "aceitar"
                        ? "Aceitar"
                        : actionDialog.action === "rejeitar"
                        ? "Rejeitar"
                        : "Cancelar"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </PermissionGuard>
    </Suspense>
  );
}
