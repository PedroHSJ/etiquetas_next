"use client";
import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/ui/navigation-button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Plus, Edit } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { ReadGuard } from "@/components/auth/PermissionGuard";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { formatCnpj } from "@/lib/utils";
import { useOrganizationsExpandedByUserQuery } from "@/hooks/useOrganizationsQuery";
import { useProfile } from "@/contexts/ProfileContext";
import { formatPhone } from "@/lib/utils/organization";
import type { Organization } from "@/types/models/organization";

export const OrganizacaoIcon = () => {
  const themeColor = "#007BFF"; // Azul vibrante
  const bgColor = "#EAEAEA";

  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          .lucide-building { transform-origin: 12px 22px; animation: scaleOrg 2s infinite alternate ease-in-out; }
          @keyframes scaleOrg {
            0%, 60% { transform: scaleY(1) translateY(0); }
            100% { transform: scaleY(1.1) translateY(-1px); }
          }
        `}
      </style>
      <rect x="0" y="0" width="64" height="64" rx="18" fill={bgColor} />

      {/* Escala de 1.5x e stroke ajustado para manter os 2.5px visuais */}
      <g
        transform="translate(14, 14) scale(1.5)"
        stroke={themeColor}
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <g className="lucide-building">
          <rect width="16" height="20" x="4" y="2" rx="2" ry="2" />
          <path d="M9 22v-4h6v4" />
          <path d="M8 6h.01" />
          <path d="M16 6h.01" />
          <path d="M12 6h.01" />
          <path d="M12 10h.01" />
          <path d="M12 14h.01" />
          <path d="M16 10h.01" />
          <path d="M16 14h.01" />
          <path d="M8 10h.01" />
          <path d="M8 14h.01" />
        </g>
      </g>
    </svg>
  );
};

interface Member {
  id: string;
  nome: string;
  departamento_id: string;
  created_at: string;
  especializacoes?: {
    id: string;
    nome: string;
    nivel: string;
  }[];
  departamento?: {
    nome: string;
    tipo_departamento: string;
    organizacao?: {
      nome: string;
      tipo: string;
    };
  };
}

export default function Page() {
  const { userId } = useAuth();
  const { userProfiles } = useProfile();
  const [filteredOrganizations, setfilteredOrganizations] = useState<
    Organization[]
  >([]);
  const [selectedOrganization, setSelectedOrganization] = useState<
    string | undefined
  >();
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(false);

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Colunas da tabela
  const organizationsColumns: GenericTableColumn<Organization>[] =
    [
      {
        id: "nome",
        key: "nome",
        label: "Nome",
        accessor: (row) => row.name,
        visible: true,
        width: 300,
        render: (value, row) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback className="bg-blue-100 text-blue-600 text-xs">
                {getInitials(row.name)}
              </AvatarFallback>
            </Avatar>
            <span className="font-medium">{value as string}</span>
          </div>
        ),
      },
      {
        id: "cnpj",
        key: "cnpj",
        label: "CNPJ",
        accessor: (row) => (row.cnpj ? formatCnpj(row.cnpj) : "--"),
        visible: true,
      },
      {
        id: "profile",
        key: "profile",
        label: "Perfil",
        accessor: () => "",
        visible: true,
        render: (_value, row) => {
          const profilesForOrg = userProfiles
            .filter(
              (p) =>
                p.userOrganization?.organization?.id === row.id && p.profile,
            )
            .map((p) => p.profile!.name);

          if (profilesForOrg.length === 0) {
            return <span className="text-sm text-muted-foreground">—</span>;
          }

          return (
            <Badge className="text-sm font-medium" variant={"outline"}>
              {profilesForOrg.join(", ")}
            </Badge>
          );
        },
      },
      {
        id: "main_phone",
        key: "main_phone",
        label: "Telefone Principal",
        accessor: (row) => row.mainPhone,
        visible: true,
        render: (value) => (
          <span className="text-sm">{formatPhone(value as string)}</span>
        ),
      },
      {
        id: "created_at",
        key: "created_at",
        label: "Cadastrado em",
        accessor: (row) => row.createdAt,
        visible: true,
        render: (value) => (
          <div className="text-sm">
            {format(new Date(value as Date), "dd/MM/yyyy", { locale: ptBR })}
          </div>
        ),
      },
    ];

  // Dialog de confirmação de exclusão
  const [deleteDialog, setDeleteDialog] = useState({
    isOpen: false,
    member: null as Member | null,
    isDeleting: false,
  });

  const { data: orgsData, isLoading: orgsLoading } =
    useOrganizationsExpandedByUserQuery(userId);

  // Filtros
  useEffect(() => {
    let filtered = orgsData || [];

    // Filtro por organização selecionada
    if (selectedOrganization) {
      filtered = filtered.filter((org) => org.id === selectedOrganization);
    }

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (org) =>
          org.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          org.cnpj?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setfilteredOrganizations(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  }, [orgsData, selectedOrganization, searchTerm]);

  // Dados paginados
  const totalItems = filteredOrganizations.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedOrganizations = filteredOrganizations.slice(
    startIndex,
    endIndex,
  );

  const openDeleteDialog = (member: Member) => {
    setDeleteDialog({
      isOpen: true,
      member,
      isDeleting: false,
    });
  };

  const closeDeleteDialog = () => {
    setDeleteDialog({
      isOpen: false,
      member: null,
      isDeleting: false,
    });
  };

  // const confirmDeleteMember = async () => {
  //   if (!deleteDialog.member) return;

  //   setDeleteDialog(prev => ({ ...prev, isDeleting: true }));

  //   try {
  //     const { error } = await supabase
  //       .from('integrantes')
  //       .delete()
  //       .eq('id', deleteDialog.member.id);

  //     if (error) throw error;

  //     // Atualizar lista
  //     if (selectedOrganization) {
  //       await fetchMembersByOrganization(selectedOrganization);
  //     } else {
  //       await fetchAllMembers();
  //     }

  //     closeDeleteDialog();
  //   } catch (error) {
  //     console.error("Erro ao excluir membro:", error);
  //     setDeleteDialog(prev => ({ ...prev, isDeleting: false }));
  //   }
  // };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const clearFilters = () => {
    setSelectedOrganization(undefined);
    setSearchTerm("");
  };

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
      <ReadGuard module="ORGANIZATIONS">
        <div className="flex flex-1 flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <OrganizacaoIcon />
              <div>
                <h1 className="text-3xl font-bold">Lista de organizações</h1>
                <p className="text-muted-foreground">
                  Visualize e gerencie todas as suas organizações
                </p>
              </div>
            </div>
            <NavigationButton href="/organizations/create">
              <Plus className="mr-2 h-4 w-4" />
              Nova Organização
            </NavigationButton>
          </div>

          {/* Tabela de Organizações */}
          <GenericTable<Organization>
            title="Organizações"
            description="Visualize e gerencie todas as suas organizações"
            columns={organizationsColumns}
            data={filteredOrganizations}
            loading={loading}
            searchable={true}
            searchPlaceholder="Buscar organização..."
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showAdvancedPagination={true}
            rowActions={(row: Organization) => {
              const hasGestorProfile = userProfiles.some(
                (profile) =>
                  profile.userOrganization?.organization?.id === row.id &&
                  profile.profile?.name?.toLowerCase() === "gestor",
              );

              if (!hasGestorProfile) {
                return null;
              }

              return (
                <div className="flex gap-1 justify-end">
                  <NavigationButton
                    href={`/organizations/edit/${row.id}`}
                    variant="outline"
                    size="sm"
                  >
                    <Edit className="h-4 w-4" />
                  </NavigationButton>
                </div>
              );
            }}
          />

          {/* Dialog de Confirmação de Exclusão */}
          <Dialog open={deleteDialog.isOpen} onOpenChange={closeDeleteDialog}>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Confirmar Exclusão
                </DialogTitle>
                <DialogDescription>
                  Esta ação não pode ser desfeita. O integrante será removido
                  permanentemente do sistema.
                </DialogDescription>
              </DialogHeader>

              {deleteDialog.member && (
                <div className="py-4">
                  <div className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarFallback className="bg-red-100 text-red-600">
                        {getInitials(deleteDialog.member.nome)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{deleteDialog.member.nome}</p>
                      <p className="text-sm text-muted-foreground">
                        {deleteDialog.member.departamento?.organizacao?.nome} •{" "}
                        {deleteDialog.member.departamento?.nome}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <DialogFooter className="gap-2">
                <Button
                  variant="outline"
                  onClick={closeDeleteDialog}
                  disabled={deleteDialog.isDeleting}
                >
                  Cancelar
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => console.log("Confirmar exclusão")} // confirmDeleteMember
                  disabled={deleteDialog.isDeleting}
                >
                  {deleteDialog.isDeleting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Excluindo...
                    </>
                  ) : (
                    <>
                      <Trash2 className="h-4 w-4 mr-2" />
                      Excluir Integrante
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </ReadGuard>
    </Suspense>
  );
}
