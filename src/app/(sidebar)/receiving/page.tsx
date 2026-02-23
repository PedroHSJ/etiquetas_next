"use client";

import { useState, useEffect, Suspense } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PlusCircle } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { ReadGuard } from "@/components/auth/PermissionGuard";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { StockService } from "@/lib/services/client/stock-service";
import { useProfile } from "@/contexts/ProfileContext";
import { StockMovementResponseDto } from "@/types/dto/stock/response";
import { EntradaRapidaDialog } from "@/components/estoque/EntradaRapidaDialog";
import { toast } from "sonner";

export const RecebimentosIcon = () => {
  const themeColor = "#28A745"; // Verde Sucesso
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
          .lucide-truck { animation: moveTruck 3s infinite ease-in-out; }
          @keyframes moveTruck {
            0%, 100% { transform: translateX(0); }
            50% { transform: translateX(4px); }
          }
        `}
      </style>
      <rect x="0" y="0" width="64" height="64" rx="18" fill={bgColor} />

      <g
        transform="translate(14, 14) scale(1.5)"
        stroke={themeColor}
        strokeWidth="1.67"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      >
        <g className="lucide-truck">
          <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
          <path d="M15 18H9" />
          <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
          <circle cx="17" cy="18" r="2" />
          <circle cx="7" cy="18" r="2" />
        </g>
      </g>
    </svg>
  );
};

export default function RecebimentoPage() {
  const { activeProfile } = useProfile();
  const organizationId = activeProfile?.userOrganization?.organization.id;

  const [movimentacoes, setMovimentacoes] = useState<
    StockMovementResponseDto[]
  >([]);
  const [filteredMovimentacoes, setFilteredMovimentacoes] = useState<
    StockMovementResponseDto[]
  >([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Estados da paginação
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Colunas da tabela
  const recebimentosColumns: GenericTableColumn<StockMovementResponseDto>[] = [
    {
      id: "movementDate",
      key: "movementDate",
      label: "Data",
      accessor: (row) => row.movementDate,
      visible: true,
      width: 180,
      render: (value) => (
        <div className="text-sm">
          {format(new Date(value as string), "dd/MM/yyyy HH:mm", {
            locale: ptBR,
          })}
        </div>
      ),
    },
    {
      id: "product",
      key: "product",
      label: "Produto",
      accessor: (row) => row.product?.name || "N/A",
      visible: true,
      width: 300,
      render: (value) => <span className="font-medium">{value as string}</span>,
    },
    {
      id: "quantity",
      key: "quantity",
      label: "Quantidade",
      accessor: (row) => row.quantity,
      visible: true,
      width: 150,
      render: (value, row) => (
        <div className="text-center">
          <div className="font-medium">
            {Number(value).toLocaleString("pt-BR", {
              minimumFractionDigits: 3,
              maximumFractionDigits: 3,
            })}
          </div>
          <div className="text-xs text-muted-foreground">
            {row.unitOfMeasureCode}
          </div>
        </div>
      ),
    },
    {
      id: "user",
      key: "user",
      label: "Usuário",
      accessor: (row) =>
        row.user?.fullName ||
        row.user?.name ||
        row.user?.email?.split("@")[0] ||
        "N/A",
      visible: true,
      width: 200,
      render: (value) => <span className="text-sm">{value as string}</span>,
    },
    {
      id: "observation",
      key: "observation",
      label: "Observação",
      accessor: (row) => row.observation,
      visible: true,
      render: (value) => (
        <div className="text-sm max-w-xs truncate" title={value as string}>
          {(value as string) || "—"}
        </div>
      ),
    },
    {
      id: "movementType",
      key: "movementType",
      label: "Tipo",
      accessor: (row) => row.movementType,
      visible: true,
      width: 120,
      render: () => (
        <Badge variant="secondary" className="bg-green-100 text-green-800">
          Entrada
        </Badge>
      ),
    },
  ];

  // Carregar movimentações de entrada
  const carregarMovimentacoes = async () => {
    if (!organizationId) return;

    setLoading(true);
    try {
      const response = await StockService.listMovements({
        organizationId,
        page: 1,
        pageSize: 1000,
      });

      // Filtrar apenas entradas
      const entradas = response.data.filter(
        (mov) => mov.movementType === "ENTRADA",
      );

      setMovimentacoes(entradas);
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
      toast.error("Erro ao carregar histórico de recebimentos");
    } finally {
      setLoading(false);
    }
  };

  // Filtros
  useEffect(() => {
    let filtered = movimentacoes;

    // Filtro por termo de busca
    if (searchTerm) {
      filtered = filtered.filter(
        (mov) =>
          mov.product?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mov.user?.fullName
            ?.toLowerCase()
            .includes(searchTerm.toLowerCase()) ||
          mov.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mov.user?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          mov.observation?.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    setFilteredMovimentacoes(filtered);
    setCurrentPage(1); // Reset para primeira página quando filtros mudam
  }, [movimentacoes, searchTerm]);

  useEffect(() => {
    carregarMovimentacoes();
  }, [organizationId]);

  // Função chamada após sucesso na entrada rápida
  const handleSuccessEntrada = () => {
    carregarMovimentacoes();
    toast.success("Recebimento registrado com sucesso!");
  };

  if (!organizationId) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="text-center text-muted-foreground py-8">
          Selecione uma organização para acessar o recebimento
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
          <div className="bg-muted/50 min-h-screen flex-1 rounded-xl md:min-h-min" />
        </div>
      }
    >
      <ReadGuard module="STOCK">
        <div className="flex flex-1 flex-col gap-6">
          {/* Cabeçalho */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <RecebimentosIcon />
              <div>
                <h1 className="text-3xl font-bold">Recebimento</h1>
                <p className="text-muted-foreground">
                  Controle de entrada de produtos no estoque
                </p>
              </div>
            </div>
            <EntradaRapidaDialog
              onSuccess={handleSuccessEntrada}
              trigger={
                <Button className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Nova Entrada
                </Button>
              }
            />
          </div>

          {/* Tabela de Recebimentos */}
          <GenericTable<StockMovementResponseDto>
            title="Histórico de Recebimentos"
            description="Visualize todas as entradas de produtos registradas"
            columns={recebimentosColumns}
            data={filteredMovimentacoes}
            loading={loading}
            searchable={true}
            searchPlaceholder="Buscar por produto, usuário ou observação..."
            itemsPerPage={itemsPerPage}
            onItemsPerPageChange={setItemsPerPage}
            showAdvancedPagination={true}
          />
        </div>
      </ReadGuard>
    </Suspense>
  );
}
