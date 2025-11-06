"use client";

import { useState, useEffect } from "react";
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
import { Stock, StockMovement, StockStatistics } from "@/types/stock/stock";

export default function EstoquePage() {
  const [estatisticas, setEstatisticas] = useState<StockStatistics | null>(
    null
  );
  const [carregandoStats, setCarregandoStats] = useState(true);

  // Estoque
  const [estoqueData, setEstoqueData] = useState<Stock[]>([]);
  const [carregandoEstoque, setCarregandoEstoque] = useState(true);
  const [paginaEstoque, setPaginaEstoque] = useState(1);
  const [itemsPerPageEstoque, setItemsPerPageEstoque] = useState(10);

  // Movimentações
  const [movimentacoesData, setMovimentacoesData] = useState<StockMovement[]>(
    []
  );
  const [carregandoMovimentacoes, setCarregandoMovimentacoes] = useState(true);
  const [paginaMovimentacoes, setPaginaMovimentacoes] = useState(1);
  const [itemsPerPageMovimentacoes, setItemsPerPageMovimentacoes] =
    useState(10);

  const carregarEstatisticas = async () => {
    setCarregandoStats(true);
    try {
      const response = await fetch("/api/estoque");
      const data = await response.json();
      console.log("data estatisticas", data);
      if (response.ok) {
        const stockData = data.data as Stock[];
        const stats: StockStatistics = {
          total_products: data.total || 0,
          products_in_stock:
            stockData.filter((p) => p.current_quantity > 0).length || 0,
          products_out_of_stock:
            stockData.filter((p) => p.current_quantity === 0).length || 0,
          products_low_stock:
            stockData.filter(
              (p) => p.current_quantity > 0 && p.current_quantity < 10
            ).length || 0,
          last_update: new Date().toISOString(),
        };
        setEstatisticas(stats);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
      toast.error("Erro ao carregar estatísticas do estoque");
    } finally {
      setCarregandoStats(false);
    }
  };

  const carregarEstoque = async () => {
    setCarregandoEstoque(true);
    try {
      const params = new URLSearchParams({
        page: paginaEstoque.toString(),
        pageSize: itemsPerPageEstoque.toString(),
      });

      const response = await fetch(`/api/estoque?${params}`);
      const data = await response.json();

      if (response.ok) {
        setEstoqueData(data.data || []);
      } else {
        toast.error(data.error || "Erro ao carregar estoque");
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Erro ao carregar dados do estoque");
    } finally {
      setCarregandoEstoque(false);
    }
  };

  const carregarMovimentacoes = async () => {
    setCarregandoMovimentacoes(true);
    try {
      const params = new URLSearchParams({
        page: paginaMovimentacoes.toString(),
        pageSize: itemsPerPageMovimentacoes.toString(),
      });

      const response = await fetch(`/api/estoque/movimentacoes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setMovimentacoesData(data.data || []);
      } else {
        toast.error(data.error || "Erro ao carregar movimentações");
      }
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
      toast.error("Erro ao carregar movimentações");
    } finally {
      setCarregandoMovimentacoes(false);
    }
  };

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  useEffect(() => {
    carregarEstoque();
  }, [paginaEstoque, itemsPerPageEstoque]);

  useEffect(() => {
    carregarMovimentacoes();
  }, [paginaMovimentacoes, itemsPerPageMovimentacoes]);

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

  const formatarData = (data: string) => {
    try {
      const date = new Date(data);
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
  const estoqueColumns: GenericTableColumn<Stock>[] = [
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
      accessor: (row) => row.current_quantity,
      visible: true,
      render: (value) => (
        <div className="font-mono text-foreground">
          {formatarQuantidade(value as number)}
        </div>
      ),
    },
    {
      id: "status",
      key: "status",
      label: "Status",
      accessor: (row) => row.current_quantity,
      visible: true,
      render: (value) => (
        <div className="">{getStatusBadge(value as number)}</div>
      ),
    },
    {
      id: "ultima_atualizacao",
      key: "ultima_atualizacao",
      label: "Última Atualização",
      accessor: (row) => row.updated_at,
      visible: true,
      render: (value) => (
        <div className="text-sm">{formatarData(value as string)}</div>
      ),
    },
  ];

  // Colunas da tabela de movimentações
  const movimentacoesColumns: GenericTableColumn<StockMovement>[] = [
    {
      id: "tipo",
      key: "tipo",
      label: "Tipo",
      accessor: (row) => row.movement_type,
      visible: true,
      render: (value) => (
        <div className="flex justify-center">
          <Badge variant={value === "ENTRADA" ? "default" : "destructive"}>
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
      accessor: (row) => row.user?.user_metadata?.full_name || "N/A",
      visible: true,
      render: (value) => (
        <div className="text-center text-sm">{value as string}</div>
      ),
    },
    {
      id: "data",
      key: "data",
      label: "Data",
      accessor: (row) => row.created_at,
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
  };

  const handleSuccessSaida = () => {
    carregarEstatisticas();
    carregarEstoque();
    carregarMovimentacoes();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Controle de Estoque
          </h1>
          <p className="text-muted-foreground">
            Gerencie o estoque de produtos e acompanhe movimentações
          </p>
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
      <EstoqueStats estatisticas={estatisticas} carregando={carregandoStats} />

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
          <GenericTable<Stock>
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
          <GenericTable<StockMovement>
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
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-red-600">
                    {estatisticas?.products_out_of_stock || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    produtos em falta
                  </p>
                  {(estatisticas?.products_out_of_stock || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        toast.info("Funcionalidade em desenvolvimento");
                      }}
                    >
                      Ver Produtos
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-600">
                  <TrendingUp className="h-5 w-5" />
                  Produtos com Estoque Baixo
                </CardTitle>
                <CardDescription>
                  Produtos que estão com quantidade baixa e precisam de atenção
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-4">
                  <div className="text-2xl font-bold text-yellow-600">
                    {estatisticas?.products_low_stock || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    produtos com estoque baixo
                  </p>
                  {(estatisticas?.products_low_stock || 0) > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      className="mt-3"
                      onClick={() => {
                        toast.info("Funcionalidade em desenvolvimento");
                      }}
                    >
                      Ver Produtos
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
