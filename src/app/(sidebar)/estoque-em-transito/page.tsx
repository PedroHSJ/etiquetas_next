"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { PackageOpen } from "lucide-react";
import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { toast } from "sonner";
import { useProfile } from "@/contexts/ProfileContext";
import { StockInTransitResponseDto } from "@/types/dto/stock-in-transit/response";
import { StockInTransitService } from "@/lib/services/client/stock-in-transit-service";
import { ReadGuard } from "@/components/auth/PermissionGuard";

export const EstoqueEmTransitoIcon = () => {
  const themeColor = "#D68910";
  const bgColor = "#EAEAEA";

  return (
    <div className="relative flex h-16 w-16 items-center justify-center rounded-2xl bg-[#EAEAEA]">
      <PackageOpen className="h-10 w-10 text-[#D68910]" strokeWidth={1.5} />
    </div>
  );
};

export default function EstoqueEmTransitoPage() {
  const { activeProfile } = useProfile();
  const organizationId =
    activeProfile?.userOrganization?.organization?.id || "";

  const [data, setData] = useState<StockInTransitResponseDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);

  const carregarDados = async () => {
    if (!organizationId) return;
    setLoading(true);
    try {
      const response = await StockInTransitService.list({
        page,
        pageSize: itemsPerPage,
        organizationId,
      });
      setData(response.data || []);
      setTotal(response.total || 0);
    } catch (error) {
      console.error("Erro ao carregar estoque em trânsito:", error);
      toast.error("Erro ao carregar dados do estoque em trânsito");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      carregarDados();
    }
  }, [page, itemsPerPage, organizationId]);

  const formatarQuantidade = (quantidade: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(quantidade);
  };

  const formatarData = (data: string | Date | null) => {
    if (!data) return "-";
    try {
      const date = typeof data === "string" ? new Date(data) : data;
      return date.toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const formatarDataHora = (data: string | Date | null) => {
    if (!data) return "-";
    try {
      const date = typeof data === "string" ? new Date(data) : data;
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "-";
    }
  };

  const columns: GenericTableColumn<StockInTransitResponseDto>[] = [
    {
      id: "product_name",
      key: "product.name",
      label: "Produto",
      accessor: (row) => row.product?.name || "N/A",
      visible: true,
      width: 250,
    },
    {
      id: "quantity",
      key: "quantity",
      label: "Quantidade",
      accessor: (row) => row.quantity,
      visible: true,
      render: (value, row) => (
        <div className="font-mono">
          {formatarQuantidade(value as number)} {row.unitOfMeasureCode}
        </div>
      ),
    },
    {
      id: "manufacturingDate",
      key: "manufacturingDate",
      label: "Data Fabricação",
      accessor: (row) => row.manufacturingDate,
      visible: true,
      render: (value) => <div>{formatarData(value as string)}</div>,
    },
    {
      id: "expiryDate",
      key: "expiryDate",
      label: "Data Validade",
      accessor: (row) => row.expiryDate,
      visible: true,
      render: (value) => <div>{formatarData(value as string)}</div>,
    },
    {
      id: "observations",
      key: "observations",
      label: "Observações",
      accessor: (row) => row.observations || "-",
      visible: true,
    },
    {
      id: "createdAt",
      key: "createdAt",
      label: "Criado em",
      accessor: (row) => row.createdAt,
      visible: true,
      render: (value) => <div>{formatarDataHora(value as string)}</div>,
    },
  ];

  return (
    <ReadGuard module="STOCK">
      <div className="flex-1 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <EstoqueEmTransitoIcon />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Estoque em Trânsito
              </h1>
              <p className="text-muted-foreground">
                Visualize os produtos que foram retirados do estoque e
                manipulados/etiquetados
              </p>
            </div>
          </div>
        </div>

        <GenericTable<StockInTransitResponseDto>
          title="Produtos em Trânsito"
          description="Relação de produtos em transição no estabelecimento"
          columns={columns}
          data={data}
          loading={loading}
          searchable={true}
          searchPlaceholder="Buscar produto..."
          itemsPerPage={itemsPerPage}
          onItemsPerPageChange={setItemsPerPage}
          showAdvancedPagination={true}
          /* Assuming pagination component is included in GenericTable based on total */
        />
      </div>
    </ReadGuard>
  );
}
