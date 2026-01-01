"use client";

import { useState, useEffect, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Package,
  PlusCircle,
  History,
  AlertTriangle,
  TrendingUp,
  Minus,
  Warehouse,
} from "lucide-react";

import {
  GenericTable,
  GenericTableColumn,
} from "@/components/ui/generic-table";
import { EstoqueStats } from "@/components/estoque/EstoqueStats";
import { EntradaRapidaDialog } from "@/components/estoque/EntradaRapidaDialog";
import { SaidaRapidaDialog } from "@/components/estoque/SaidaRapidaDialog";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Popover } from "@radix-ui/react-popover";
import { PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { StockStatistics } from "@/types/stock/stock";
import { useProfile } from "@/contexts/ProfileContext";
import {
  StockListModelResponse,
  MovementListModelResponse,
  StockModel,
  StockMovementModel,
} from "@/types/models/stock";
import { StockService } from "@/lib/services/client/stock-service";
import { useStorageLocationsQuery } from "@/hooks/useStorageLocationsQuery";
import type { StorageLocation } from "@/types/models/storage-location";
import { ReadGuard } from "@/components/auth/PermissionGuard";

export default function EstoquePage() {
  const { activeProfile } = useProfile();
  const organizationId = activeProfile?.userOrganization?.organizationId || "";
  const [estatisticas, setEstatisticas] = useState<StockStatistics | null>(
    null
  );
  const [carregandoStats, setCarregandoStats] = useState(true);

  // Estoque
  const [estoqueData, setEstoqueData] = useState<StockModel[]>([]);
  const [carregandoEstoque, setCarregandoEstoque] = useState(true);
  const [itemsPerPageEstoque, setItemsPerPageEstoque] = useState(10);

  // Movimentações
  const [movimentacoesData, setMovimentacoesData] = useState<
    StockMovementModel[]
  >([]);
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] = useState(true);
  const [itemsPerPageMovimentacoes, setItemsPerPageMovimentacoes] =
    useState(10);
  const [estoquesZerados, setEstoquesZerados] = useState<StockModel[]>([]);
  const [estoquesBaixos, setEstoquesBaixos] = useState<StockModel[]>([]);
  const [carregandoZerados, setCarregandoZerados] = useState(false);
  const [carregandoBaixos, setCarregandoBaixos] = useState(false);

  // Fetch storage locations for path building
  const { data: storageLocations = [] } = useStorageLocationsQuery({
    organizationId,
    enabled: !!organizationId,
  });

  const locationMapRef = useRef<Map<string, StorageLocation>>(new Map());

  useEffect(() => {
    locationMapRef.current = new Map(
      storageLocations.map((location) => [location.id, location])
    );
  }, [storageLocations]);

  const buildLocationPath = (locationId: string | null | undefined): string => {
    if (!locationId) return "-";

    const paths: string[] = [];
    let current = locationMapRef.current.get(locationId);
    while (current) {
      paths.unshift(current.name);
      current = current.parentId
        ? locationMapRef.current.get(current.parentId)
        : undefined;
    }
    return paths.length > 0 ? paths.join(" > ") : "-";
  };

  const carregarEstatisticas = async () => {
    if (!organizationId) return;
    setCarregandoStats(true);
    try {
      const stats = await StockService.getStockStatistics(organizationId);
      setEstatisticas(stats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas do estoque");
    } finally {
      setCarregandoStats(false);
    }
  };

  const carregarEstoque = async () => {
    if (!organizationId) return;
    setCarregandoEstoque(true);
    try {
      const response: StockListModelResponse = await StockService.listStock({
        page: 1,
        pageSize: itemsPerPageEstoque,
        organizationId,
      });
      setEstoqueData(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Erro ao carregar dados do estoque");
    } finally {
      setCarregandoEstoque(false);
    }
  };

  const carregarMovimentacoes = async () => {
    if (!organizationId) return;
    setCarregandoMovimentacoes(true);
    try {
      const response: MovementListModelResponse =
        await StockService.listMovements({
          page: 1,
          pageSize: itemsPerPageMovimentacoes,
          organizationId,
        });
      setMovimentacoesData(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
      toast.error("Erro ao carregar movimentações");
    } finally {
      setCarregandoMovimentacoes(false);
    }
  };

  useEffect(() => {
    if (organizationId) {
      carregarEstatisticas();
      carregarAlertas();
    }
  }, [organizationId]);

  useEffect(() => {
    if (organizationId) {
      carregarEstoque();
    }
  }, [itemsPerPageEstoque, organizationId]);

  useEffect(() => {
    if (organizationId) {
      carregarMovimentacoes();
    }
  }, [itemsPerPageMovimentacoes, organizationId]);

  const carregarAlertas = async () => {
    if (!organizationId) return;
    setCarregandoZerados(true);
    setCarregandoBaixos(true);

    try {
      const [zerados, baixos] = await Promise.all([
        StockService.listStock({
          page: 1,
          pageSize: 50,
          estoque_zerado: true,
          organizationId,
        }),
        StockService.listStock({
          page: 1,
          pageSize: 50,
          estoque_baixo: true,
          quantidade_minima: 10,
          organizationId,
        }),
      ]);

      setEstoquesZerados(zerados.data || []);
      setEstoquesBaixos(baixos.data || []);
    } catch (error) {
      console.error("Erro ao carregar alertas de estoque:", error);
      toast.error("Erro ao carregar alertas de estoque");
    } finally {
      setCarregandoZerados(false);
      setCarregandoBaixos(false);
    }
  };

  useEffect(() => {
    carregarAlertas();
  }, []);

  const formatarQuantidade = (quantidade: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(quantidade);
  };

  const getStatusBadge = (quantidade: number) => {
    if (quantidade === 0) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Badge variant="destructive" className="cursor-pointer">
              Zerado
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="text-sm">
              Este produto está com o estoque zerado. Considere realizar uma
              entrada de estoque para repor o item.
            </div>
          </PopoverContent>
        </Popover>
      );
      // return <Badge variant="destructive">Zerado</Badge>;
    }
    if (quantidade < 10) {
      return (
        <Popover>
          <PopoverTrigger asChild>
            <Badge variant="default" className="cursor-pointer">
              Baixo
            </Badge>
          </PopoverTrigger>
          <PopoverContent className="w-64">
            <div className="text-sm">
              Este produto está com o estoque abaixo de 10 unidades. Considere
              realizar uma entrada de estoque para repor o item.
            </div>
          </PopoverContent>
        </Popover>
      );
    }
    return (
      <Popover>
        <PopoverTrigger asChild>
          <Badge variant="default" className="cursor-pointer">
            OK
          </Badge>
        </PopoverTrigger>
        <PopoverContent className="w-64">
          <div className="text-sm">
            Este produto está com o estoque acima de 10 unidades.
          </div>
        </PopoverContent>
      </Popover>
    );
  };

  const formatarData = (data: string | Date) => {
    try {
      const date = data instanceof Date ? data : new Date(data);
      return date.toLocaleString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    } catch {
      return "Data inválida";
    }
  };

  // Colunas da tabela de estoque
  const estoqueColumns: GenericTableColumn<StockModel>[] = [
    {
      id: "product_name",
      key: "product.name",
      label: "Produto",
      accessor: (row) => row.product?.name || "N/A",
      visible: true,
      width: 300,
    },
    {
      id: "current_quantity",
      key: "current_quantity",
      label: "Quantidade",
      accessor: (row) => row.currentQuantity,
      visible: true,
      render: (value) => (
        <div className="font-mono text-foreground">
          {formatarQuantidade(value as number)}
        </div>
      ),
    },
    // {
    //   id: "status",
    //   key: "status",
    //   label: "Status",
    //   accessor: (row) => row.current_quantity,
    //   visible: true,
    //   render: (value) => (
    //     <div className="">{getStatusBadge(value as number)}</div>
    //   ),
    // },
    {
      id: "unit_of_measure_code",
      key: "unitOfMeasureCode",
      label: "Unidade de Medida",
      accessor: (row) => row?.unitOfMeasureCode || "N/A",
      visible: true,
    },
    {
      id: "storage_location",
      key: "storageLocation",
      label: "Localização Física",
      accessor: (row) => row.storageLocation?.name || "-",
      visible: true,
      render: (value, row) => {
        const fullPath = buildLocationPath(
          row.storageLocationId || row.storageLocation?.id
        );
        if (fullPath === "-") {
          return <span className="text-muted-foreground">-</span>;
        }

        return <span title={fullPath}>{fullPath}</span>;
      },
    },
    {
      id: "ultima_atualizacao",
      key: "ultima_atualizacao",
      label: "Última Atualização",
      accessor: (row) => row.updatedAt,
      visible: true,
      render: (value) => (
        <div className="text-sm">{formatarData(value as string)}</div>
      ),
    },
  ];

  // Colunas da tabela de movimentações
  const movimentacoesColumns: GenericTableColumn<StockMovementModel>[] = [
    {
      id: "tipo",
      key: "tipo",
      label: "Tipo",
      accessor: (row) => row.movementType,
      visible: true,
      render: (value) => (
        <div className="flex justify-center">
          <Badge
            variant={value === "ENTRADA" ? "outline" : "destructive"}
            className={
              value === "ENTRADA"
                ? "bg-green-100 text-green-800 border border-green-200"
                : undefined
            }
          >
            {value === "ENTRADA" ? "Entrada" : "Saída"}
          </Badge>
        </div>
      ),
    },
    {
      id: "produto_nome",
      key: "produto_nome",
      label: "Produto",
      accessor: (row) => row.product?.name || "N/A",
      visible: true,
      width: 300,
    },
    {
      id: "quantidade",
      key: "quantidade",
      label: "Quantidade",
      accessor: (row) => row.quantity,
      visible: true,
      render: (value) => (
        <div className="font-mono text-center">
          {formatarQuantidade(value as number)}
        </div>
      ),
    },
    {
      id: "observacao",
      key: "observacao",
      label: "Observação",
      accessor: (row) => row.observation || "-",
      visible: true,
      width: 250,
    },
    {
      id: "usuario",
      key: "usuario",
      label: "Usuário",
      accessor: (row) => row.user?.fullName || row.user?.name || "N/A",
      visible: true,
      render: (value) => (
        <div className="text-center text-sm">{value as string}</div>
      ),
    },
    {
      id: "data",
      key: "data",
      label: "Data",
      accessor: (row) => row.movementDate,
      visible: true,
      render: (value) => (
        <div className="text-sm text-center">
          {formatarData(value as string)}
        </div>
      ),
    },
  ];

  const handleSuccessEntrada = () => {
    carregarEstatisticas();
    carregarEstoque();
    carregarMovimentacoes();
    carregarAlertas();
  };

  const handleSuccessSaida = () => {
    carregarEstatisticas();
    carregarEstoque();
    carregarMovimentacoes();
    carregarAlertas();
  };

  return (
    <ReadGuard module="STOCK">
      <div className="flex-1 space-y-6">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center">
              <Warehouse className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Controle de Estoque
              </h1>
              <p className="text-muted-foreground">
                Gerencie o estoque de produtos e acompanhe movimentações
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <EntradaRapidaDialog
              onSuccess={handleSuccessEntrada}
              trigger={
                <Button size="sm" className="gap-2">
                  <PlusCircle className="h-4 w-4" />
                  Entrada Rápida
                </Button>
              }
            />
            <SaidaRapidaDialog
              onSuccess={handleSuccessSaida}
              trigger={
                <Button size="sm" variant="destructive" className="gap-2">
                  <Minus className="h-4 w-4" />
                  Saída Rápida
                </Button>
              }
            />
          </div>
        </div>

        {/* Estatísticas */}
        <EstoqueStats
          estatisticas={estatisticas}
          carregando={carregandoStats}
        />

        {/* Conteúdo Principal */}
        <Tabs defaultValue="estoque" className="space-y-4">
          <TabsList>
            <TabsTrigger value="estoque" className="gap-2">
              <Package className="h-4 w-4" />
              Estoque Atual
            </TabsTrigger>
            <TabsTrigger value="movimentacoes" className="gap-2">
              <History className="h-4 w-4" />
              Movimentações
            </TabsTrigger>
            <TabsTrigger value="alertas" className="gap-2">
              <AlertTriangle className="h-4 w-4" />
              Alertas
            </TabsTrigger>
          </TabsList>

          <TabsContent value="estoque" className="space-y-4">
            <GenericTable<StockModel>
              title="Estoque de Produtos"
              description="Visualize e gerencie o estoque atual de todos os produtos"
              columns={estoqueColumns}
              data={estoqueData}
              loading={carregandoEstoque}
              searchable={true}
              searchPlaceholder="Buscar produto..."
              itemsPerPage={itemsPerPageEstoque}
              onItemsPerPageChange={setItemsPerPageEstoque}
              showAdvancedPagination={true}
            />
          </TabsContent>

          <TabsContent value="movimentacoes" className="space-y-4">
            <GenericTable<StockMovementModel>
              title="Histórico de Movimentações"
              description="Acompanhe todas as entradas e saídas de estoque"
              columns={movimentacoesColumns}
              data={movimentacoesData}
              loading={carregandoMovimentacoes}
              searchable={true}
              searchPlaceholder="Buscar movimentação..."
              itemsPerPage={itemsPerPageMovimentacoes}
              onItemsPerPageChange={setItemsPerPageMovimentacoes}
              showAdvancedPagination={true}
            />
          </TabsContent>

          <TabsContent value="alertas" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-red-600">
                    <AlertTriangle className="h-5 w-5" />
                    Produtos com Estoque Zerado
                  </CardTitle>
                  <CardDescription>
                    Produtos que estão em falta e precisam de reposição urgente
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {carregandoZerados ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Carregando produtos...
                    </div>
                  ) : estoquesZerados.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Nenhum produto com estoque zerado.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {estoquesZerados.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between rounded-md border border-red-100 bg-red-50 px-3 py-2 text-sm"
                        >
                          <span className="font-medium text-red-700">
                            {item.product?.name || "Produto"}
                          </span>
                          <Badge variant="destructive">Zerado</Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-yellow-600">
                    <TrendingUp className="h-5 w-5" />
                    Produtos com Estoque Baixo
                  </CardTitle>
                  <CardDescription>
                    Produtos que estão com quantidade baixa e precisam de
                    atenção
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {carregandoBaixos ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Carregando produtos...
                    </div>
                  ) : estoquesBaixos.length === 0 ? (
                    <div className="text-sm text-muted-foreground py-2">
                      Nenhum produto com estoque baixo.
                    </div>
                  ) : (
                    <ul className="space-y-2">
                      {estoquesBaixos.map((item) => (
                        <li
                          key={item.id}
                          className="flex items-center justify-between rounded-md border border-yellow-100 bg-yellow-50 px-3 py-2 text-sm"
                        >
                          <div className="flex flex-col">
                            <span className="font-medium text-yellow-800">
                              {item.product?.name || "Produto"}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {`Em estoque: ${formatarQuantidade(
                                item.currentQuantity
                              )}`}
                            </span>
                          </div>
                          <Badge
                            variant="outline"
                            className="border-yellow-200 text-yellow-800"
                          >
                            Baixo
                          </Badge>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ReadGuard>
  );
}
