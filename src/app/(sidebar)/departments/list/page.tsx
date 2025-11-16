"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { NavigationButton } from "@/components/ui/navigation-button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { AlertTriangle, Trash2, Plus, Edit, Building2 } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { toast } from "sonner";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { capitalize } from "@/lib/utils";
import { DepartmentWithOrganization } from "@/types/models/department";
import { DepartmentService } from "@/lib/services/client/department-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function DepartmentsListPage() {
  const { userId } = useAuth();
  const { selectedOrganization } = useOrganization();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingDepartment, setDeletingDepartment] =
    useState<DepartmentWithOrganization | null>(null);
  const [deleting, setDeleting] = useState(false);

  const { data: departments = [], isLoading: isQueryLoading } = useQuery<
    DepartmentWithOrganization[],
    Error
  >({
    queryKey: ["departments", selectedOrganization?.id],
    queryFn: async () => {
      if (!userId || !selectedOrganization?.id) {
        return [];
      }
      return await DepartmentService.getDepartments({
        organizationId: selectedOrganization.id,
      });
    },
    enabled: !!userId && !!selectedOrganization?.id,
  });

  useEffect(() => {
    setLoading(isQueryLoading);
  }, [isQueryLoading]);

  const handleDeleteClick = (department: DepartmentWithOrganization) => {
    setDeletingDepartment(department);
    setDeleteDialogOpen(true);
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  // Definir colunas da tabela
  const departmentColumns: GenericTableColumn<DepartmentWithOrganization>[] = [
    {
      id: "nome",
      key: "nome",
      label: "Nome",
      accessor: (row) => row.name,
      visible: true,
      width: 300,
    },
    {
      id: "tipo_departamento",
      key: "tipo_departamento",
      label: "Tipo",
      accessor: (row) => capitalize(row.departmentType || ""),
      visible: true,
      render: (value) => <Badge variant="secondary">{value as string}</Badge>,
    },
    {
      id: "created_at",
      key: "created_at",
      label: "Data de Criação",
      accessor: (row) => row.createdAt.toString(),
      visible: true,
      render: (value) => formatarData(value as string),
    },
  ];

  const handleDeleteConfirm = async () => {
    if (!deletingDepartment) return;

    setDeleting(true);
    try {
      const success = await DepartmentService.deleteDepartment(
        deletingDepartment.id
      );

      if (!success) {
        toast.error("Erro ao excluir departamento");
        return;
      }

      toast.success("Departamento excluído com sucesso!");
      if (selectedOrganization?.id) {
        queryClient.invalidateQueries({
          queryKey: ["departments", selectedOrganization.id],
        });
      }
    } catch (error) {
      console.error("Erro inesperado:", error);
      toast.error("Erro inesperado ao excluir departamento");
    } finally {
      setDeleting(false);
      setDeleteDialogOpen(false);
      setDeletingDepartment(null);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
              <svg
                className="w-7 h-7 text-white"
                viewBox="0 0 24 24"
                fill="currentColor"
              >
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            </div>
            <div>
              <h1 className="text-3xl font-bold">Departamentos</h1>
              <p className="text-muted-foreground">
                Carregando departamentos...
              </p>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-teal-500 to-cyan-600 rounded-xl flex items-center justify-center shadow-lg">
            <svg
              className="w-7 h-7 text-white"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <div>
            <h1 className="text-3xl font-bold">Departamentos</h1>
            <p className="text-muted-foreground">
              Gerencie os departamentos das suas organizações
            </p>
          </div>
        </div>
        <NavigationButton href="/departments/create">
          <Plus className="h-4 w-4 mr-2" />
          Novo Departamento
        </NavigationButton>
      </div>

      {/* Lista de Departamentos */}
      {departments.length === 0 ? (
        <Card className="p-12">
          <div className="text-center">
            <Building2 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">
              Nenhum departamento cadastrado
            </h3>
            <p className="text-muted-foreground mb-4">
              Comece criando seu primeiro departamento
            </p>
            <NavigationButton href="/departments/create">
              <Plus className="h-4 w-4 mr-2" />
              Criar Departamento
            </NavigationButton>
          </div>
        </Card>
      ) : (
        <GenericTable
          data={departments}
          columns={departmentColumns}
          searchable
          searchPlaceholder="Buscar departamentos..."
          // rowActions={(row) => (
          //   <div className="flex gap-1">
          //     <NavigationButton
          //       href={`/departments/edit/${row.id}`}
          //       variant="outline"
          //       size="sm"
          //     >
          //       <Edit className="h-4 w-4" />
          //     </NavigationButton>
          //     {/* <Button
          //       variant="outline"
          //       size="sm"
          //       onClick={() => handleDeleteClick(row)}
          //     >
          //       <Trash2 className="h-4 w-4" />
          //     </Button> */}
          //   </div>
          // )}
        />
      )}

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Confirmar Exclusão
            </DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o departamento{" "}
              <strong>{deletingDepartment?.name}</strong>?
              <br />
              <br />
              Esta ação não pode ser desfeita e todos os integrantes e dados
              relacionados a este departamento serão afetados.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={deleting}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteConfirm}
              disabled={deleting}
            >
              {deleting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                  Excluindo...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Excluir Departamento
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
