"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  TrendingUp,
  TrendingDown,
  MoreHorizontal,
  Package,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EstoqueFiltros,
  EstoqueListResponse,
  ESTOQUE_PAGINATION,
} from "@/types/estoque";
import { EntradaRapidaDialog } from "./EntradaRapidaDialog";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import { fetchWithAuth } from "@/lib/fetchWithAuth";

interface EstoqueTableProps {
  onViewMovimentacoes?: (produtoId: number, produtoNome: string) => void;
}

export function EstoqueTable({ onViewMovimentacoes }: EstoqueTableProps) {
  const [dados, setDados] = useState<EstoqueListResponse | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [filtros, setFiltros] = useState<EstoqueFiltros>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [termoBusca, setTermoBusca] = useState("");

  const carregarDados = async () => {
    setCarregando(true);
    try {
      const params = new URLSearchParams({
        page: paginaAtual.toString(),
        pageSize: ESTOQUE_PAGINATION.DEFAULT_PAGE_SIZE.toString(),
      });

      // Adicionar filtros aos params
      if (termoBusca) params.append("produto_nome", termoBusca);
      if (filtros.estoque_zerado) params.append("estoque_zerado", "true");
      if (filtros.estoque_baixo && filtros.quantidade_minima) {
        params.append("estoque_baixo", "true");
        params.append(
          "quantidade_minima",
          filtros.quantidade_minima.toString()
        );
      }

      const response = await fetchWithAuth(`/api/estoque?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDados(data);
      } else {
        toast.error(data.error || "Erro ao carregar dados do estoque");
      }
    } catch (error) {
      console.error("Erro ao carregar estoque:", error);
      toast.error("Erro ao carregar dados do estoque");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    carregarDados();
  }, [paginaAtual, filtros]);

  // Busca com debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      if (termoBusca !== filtros.produto_nome) {
        setFiltros((prev) => ({ ...prev, produto_nome: termoBusca }));
        setPaginaAtual(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [termoBusca, filtros.produto_nome]);

  const handleFiltroChange = (
    key: keyof EstoqueFiltros,
    value: string | boolean | number | undefined
  ) => {
    setFiltros((prev) => ({ ...prev, [key]: value }));
    setPaginaAtual(1);
  };

  const formatarQuantidade = (quantidade: number) => {
    return new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(quantidade);
  };

  const getStatusBadge = (quantidade: number) => {
    if (quantidade === 0) {
      return <Badge variant="destructive">Zerado</Badge>;
    }
    if (quantidade < 10) {
      // Critério simples para estoque baixo
      return <Badge variant="secondary">Baixo</Badge>;
    }
    return <Badge variant="default">Normal</Badge>;
  };

  const formatarDataUltimaAtualizacao = (data: string) => {
    try {
      return formatDistanceToNow(new Date(data), {
        addSuffix: true,
        locale: ptBR,
      });
    } catch {
      return "Data inválida";
    }
  };

  if (carregando && !dados) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          <Skeleton className="h-10 flex-1" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Última Atualização</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell>
                    <Skeleton className="h-4 w-40" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-20" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-6 w-16" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-24" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-8 w-8" />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar produto..."
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            className="pl-10"
          />
        </div>

        <Select
          value={
            filtros.estoque_zerado
              ? "zerado"
              : filtros.estoque_baixo
              ? "baixo"
              : "todos"
          }
          onValueChange={(value) => {
            if (value === "zerado") {
              handleFiltroChange("estoque_zerado", true);
              handleFiltroChange("estoque_baixo", false);
            } else if (value === "baixo") {
              handleFiltroChange("estoque_zerado", false);
              handleFiltroChange("estoque_baixo", true);
              handleFiltroChange("quantidade_minima", 10);
            } else {
              handleFiltroChange("estoque_zerado", false);
              handleFiltroChange("estoque_baixo", false);
            }
          }}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="todos">Todos os produtos</SelectItem>
            <SelectItem value="zerado">Estoque zerado</SelectItem>
            <SelectItem value="baixo">Estoque baixo</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Tabela */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Produto</TableHead>
              <TableHead className="text-center">Quantidade</TableHead>
              <TableHead className="text-center">Status</TableHead>
              <TableHead>Última Atualização</TableHead>
              <TableHead className="text-center">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {dados?.data.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8">
                  <div className="flex flex-col items-center gap-2">
                    <Package className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {termoBusca
                        ? "Nenhum produto encontrado"
                        : "Nenhum produto em estoque"}
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              dados?.data.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="text-center">
                    {getStatusBadge(item.current_quantity)}
                  </TableCell>

                  <TableCell>
                    <div className="text-sm">
                      {formatarDataUltimaAtualizacao(item.updated_at)}
                      {item.user?.user_metadata?.full_name && (
                        <div className="text-muted-foreground">
                          por {item.user.user_metadata.full_name}
                        </div>
                      )}
                    </div>
                  </TableCell>

                  <TableCell className="text-center">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <EntradaRapidaDialog
                          selectedProductId={item.productId}
                          onSuccess={carregarDados}
                          trigger={
                            <DropdownMenuItem
                              onSelect={(e) => e.preventDefault()}
                            >
                              <TrendingUp className="mr-2 h-4 w-4" />
                              Dar Entrada
                            </DropdownMenuItem>
                          }
                        />
                        <DropdownMenuItem
                          onClick={() =>
                            onViewMovimentacoes?.(
                              item.productId,
                              item.product?.name || "Produto"
                            )
                          }
                        >
                          <TrendingDown className="mr-2 h-4 w-4" />
                          Ver Movimentações
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {/* Paginação */}
      {dados && dados.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            Mostrando {(dados.page - 1) * dados.pageSize + 1} a{" "}
            {Math.min(dados.page * dados.pageSize, dados.total)} de{" "}
            {dados.total} produtos
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={dados.page <= 1}
              onClick={() => setPaginaAtual((prev) => prev - 1)}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={dados.page >= dados.totalPages}
              onClick={() => setPaginaAtual((prev) => prev + 1)}
            >
              Próxima
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
