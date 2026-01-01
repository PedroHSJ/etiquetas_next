"use client";

import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Users } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Member } from "@/types/models/member";
import { MemberService } from "@/lib/services/client/member-service";
import { useOrganization } from "@/contexts/OrganizationContext";
import { ReadGuard } from "@/components/auth/PermissionGuard";

function getInitials(name: string) {
  if (!name) return "US";
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

export default function MembersListPage() {
  const { selectedOrganization } = useOrganization();

  const organizationId = selectedOrganization?.id;

  const { data: members = [], isLoading } = useQuery<Member[], Error>({
    queryKey: ["members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return MemberService.listByOrganization(organizationId);
    },
    enabled: !!organizationId,
  });

  const columns = useMemo<GenericTableColumn<Member>[]>(() => {
    return [
      {
        id: "member",
        key: "member",
        label: "Integrante",
        accessor: (row) =>
          `${row.user.name ?? ""} ${row.user.email ?? ""}`.trim(),
        visible: true,
        width: 280,
        fixed: true,
        render: (_value, row) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10">
              <AvatarImage
                src={row.user.avatarUrl ?? undefined}
                alt={row.user.name}
              />
              <AvatarFallback className="bg-primary/10 text-primary">
                {getInitials(row.user.name)}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="font-medium">{row.user.name}</div>
              <div className="text-sm text-muted-foreground">
                {row.user.email || "—"}
              </div>
            </div>
          </div>
        ),
      },
      {
        id: "profile",
        key: "profile",
        label: "Perfil",
        accessor: (row) => row.profile?.name ?? "",
        visible: true,
        render: (_value, row) =>
          row.profile ? (
            <Badge
              variant={`${
                row.profile?.name?.toLowerCase() == "gestor"
                  ? "default"
                  : "outline"
              }`}
              className="font-medium"
            >
              {row.profile.name}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          ),
      },
      {
        id: "status",
        key: "status",
        label: "Status",
        accessor: (row) => (row.active ? "Ativo" : "Inativo"),
        visible: true,
        render: (_value, row) => (
          <Badge
            variant={row.active ? "default" : "outline"}
            className={
              row.active
                ? "bg-green-100 text-green-700 border-green-200"
                : "text-muted-foreground"
            }
          >
            {row.active ? "Ativo" : "Inativo"}
          </Badge>
        ),
      },
      {
        id: "entryDate",
        key: "entryDate",
        label: "Entrada",
        accessor: (row) => row.entryDate?.toISOString() ?? "",
        visible: true,
        render: (_value, row) => (
          <span className="text-sm">
            {row.entryDate
              ? format(row.entryDate, "dd/MM/yyyy", { locale: ptBR })
              : "—"}
          </span>
        ),
      },
      {
        id: "exitDate",
        key: "exitDate",
        label: "Saída",
        accessor: (row) => row.exitDate?.toISOString() ?? "",
        visible: true,
        render: (_value, row) => (
          <span className="text-sm">
            {row.exitDate
              ? format(row.exitDate, "dd/MM/yyyy", { locale: ptBR })
              : "—"}
          </span>
        ),
      },
      {
        id: "createdAt",
        key: "createdAt",
        label: "Vinculado em",
        accessor: (row) => row.createdAt?.toISOString() ?? "",
        visible: true,
        render: (_value, row) => (
          <span className="text-sm">
            {row.createdAt
              ? format(row.createdAt, "dd/MM/yyyy", { locale: ptBR })
              : "—"}
          </span>
        ),
      },
    ];
  }, []);

  if (!selectedOrganization) {
    return (
      <div>
        <Card>
          <CardContent className="py-10 text-center space-y-2">
            <p className="text-lg font-semibold">
              Selecione uma organização para visualizar os membros.
            </p>
            <p className="text-sm text-muted-foreground">
              Escolha uma organização no topo da tela para continuar.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <ReadGuard module="MEMBERS">
      <div className="flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Integrantes</h1>
              <p className="text-muted-foreground">
                Gerencie os membros vinculados a {selectedOrganization.name}
              </p>
            </div>
          </div>
          <Badge variant="secondary" className="text-base py-2 px-4">
            {members.length} membro(s)
          </Badge>
        </div>

        <GenericTable<Member>
          title="Lista de membros"
          description="Visualize todos os integrantes ativos e inativos da organização"
          columns={columns}
          data={members}
          loading={isLoading}
          searchPlaceholder="Buscar por nome, e-mail ou perfil..."
        />
      </div>
    </ReadGuard>
  );
}
