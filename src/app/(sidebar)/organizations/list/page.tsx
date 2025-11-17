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
import { PermissionGuard } from "@/components/auth/PermissionGuard";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { formatCnpj } from "@/lib/utils";
import { Organization } from "@/types/models/organization";
import { useQuery } from "@tanstack/react-query";
import { OrganizationService } from "@/lib/services/client/organization-service";
import { useProfile } from "@/contexts/ProfileContext";
import { formatPhone } from "@/lib/converters";

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
  const organizationsColumns: GenericTableColumn<Organization>[] = [
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
            (p) => p.userOrganization?.organizationId === row.id && p.profile
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
          {format(new Date(value as string), "dd/MM/yyyy", { locale: ptBR })}
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

  const { data: orgsData, isLoading: orgsLoading } = useQuery<
    Organization[],
    Error
  >({
    queryKey: ["organizations", userId],
    queryFn: async () => {
      if (!userId) return [];
      return await OrganizationService.getOrganizationsByUserIdExpanded(userId);
    },
    enabled: !!userId,
  });

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
          org.cnpj?.toLowerCase().includes(searchTerm.toLowerCase())
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
    endIndex
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
      <PermissionGuard funcionalidade="Organizações" acao="visualizar">
        <div className="flex flex-1 flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                <svg
                  className="w-7 h-7 text-white"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
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
                  profile.userOrganization?.organizationId === row.id &&
                  profile.profile?.name?.toLowerCase() === "gestor"
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
      </PermissionGuard>
    </Suspense>
  );
}
