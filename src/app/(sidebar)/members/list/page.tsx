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
import { MemberResponseDto } from "@/types/dto/member/response";
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

import React from "react";

export const MembrosIcon = () => {
  const themeColor = "#6F42C1"; // Roxo
  const bgColor = "#EAEAEA"; // Cor do fundo para "recortar" os elementos
  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          .front-user { animation: popUser 2.5s infinite alternate ease-in-out; transform-origin: 26px 46px; }
          @keyframes popUser { 
            0%, 70% { transform: scale(1); } 
            100% { transform: scale(1.05); } 
          }
        `}
      </style>
      <rect x="0" y="0" width="64" height="64" rx="18" fill={bgColor} />
      <g
        stroke={themeColor}
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <circle cx="40" cy="24" r="5" fill={themeColor} opacity="0.3" />
        <path
          d="M48 42C48 38.5 45.5 35.5 40 35.5C38 35.5 36.2 36.1 35 37"
          opacity="0.5"
        />
        <g className="front-user">
          {/* Preenchimento da cor do fundo para esconder o usuário de trás */}
          <path
            d="M14 46C14 40.5 18.5 36.5 26 36.5C33.5 36.5 38 40.5 38 46"
            fill={bgColor}
          />
          <circle cx="26" cy="28" r="6" fill={themeColor} />
          <path d="M14 46C14 40.5 18.5 36.5 26 36.5C33.5 36.5 38 40.5 38 46" />
        </g>
      </g>
    </svg>
  );
};

export default function MembersListPage() {
  const { selectedOrganization } = useOrganization();

  const organizationId = selectedOrganization?.id;

  const { data: members = [], isLoading } = useQuery<
    MemberResponseDto[],
    Error
  >({
    queryKey: ["members", organizationId],
    queryFn: async () => {
      if (!organizationId) return [];
      return MemberService.listByOrganization(organizationId);
    },
    enabled: !!organizationId,
  });

  const columns = useMemo<GenericTableColumn<MemberResponseDto>[]>(() => {
    return [
      {
        id: "member",
        key: "member",
        label: "Integrante",
        accessor: (row) => {
          const name = row?.user?.name || row?.users?.name || "";
          const email = row?.user?.email || row?.users?.email || "";
          return `${name} ${email}`.trim();
        },
        visible: true,
        width: 280,
        fixed: true,
        render: (_value, row) => {
          const name = row?.user?.name || row?.users?.name;
          const email = row?.user?.email || row?.users?.email;
          const avatarUrl = row?.user?.avatarUrl || row?.users?.image;

          return (
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={avatarUrl ?? undefined}
                  alt={name ?? undefined}
                />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {name ? getInitials(name) : "US"}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="font-medium">{name}</div>
                <div className="text-sm text-muted-foreground">
                  {email || "—"}
                </div>
              </div>
            </div>
          );
        },
      },
      {
        id: "profile",
        key: "profile",
        label: "Perfil",
        accessor: (row) => row.profile?.name || row.profiles?.name || "",
        visible: true,
        render: (_value, row) => {
          const profileName = row.profile?.name || row.profiles?.name;
          return profileName ? (
            <Badge
              variant={`${
                profileName.toLowerCase() === "gestor" ? "default" : "outline"
              }`}
              className="font-medium"
            >
              {profileName}
            </Badge>
          ) : (
            <span className="text-sm text-muted-foreground">—</span>
          );
        },
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
        accessor: (row) => row.entryDate ?? "",
        visible: true,
        render: (_value, row) => (
          <span className="text-sm">
            {row.entryDate
              ? format(new Date(row.entryDate), "dd/MM/yyyy", { locale: ptBR })
              : "—"}
          </span>
        ),
      },
      {
        id: "createdAt",
        key: "createdAt",
        label: "Vinculado em",
        accessor: (row) => row.createdAt ?? "",
        visible: true,
        render: (_value, row) => (
          <span className="text-sm">
            {row.createdAt
              ? format(new Date(row.createdAt), "dd/MM/yyyy", { locale: ptBR })
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
            <MembrosIcon />
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

        <GenericTable<MemberResponseDto>
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
