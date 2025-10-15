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
  Calendar,
  User,
  FileText,
  ArrowLeft 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  EstoqueMovimentacao, 
  MovimentacoesFiltros, 
  MovimentacoesListResponse,
  ESTOQUE_PAGINATION,
  TipoMovimentacao 
} from "@/types/estoque";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface MovimentacoesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  produtoId?: number;
  produtoNome?: string;
}

export function MovimentacoesDialog({ 
  open, 
  onOpenChange, 
  produtoId, 
  produtoNome 
}: MovimentacoesDialogProps) {
  const [dados, setDados] = useState<MovimentacoesListResponse | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [filtros, setFiltros] = useState<MovimentacoesFiltros>({});
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [termoBusca, setTermoBusca] = useState("");

  const carregarDados = async () => {
    if (!open) return;
    
    setCarregando(true);
    try {
      const params = new URLSearchParams({
        page: paginaAtual.toString(),
        pageSize: ESTOQUE_PAGINATION.DEFAULT_PAGE_SIZE.toString(),
      });

      // Adicionar filtro do produto se especificado
      if (produtoId) {
        params.append("produto_id", produtoId.toString());
      }

      // Adicionar outros filtros
      if (termoBusca) params.append("produto_nome", termoBusca);
      if (filtros.tipo_movimentacao) params.append("tipo_movimentacao", filtros.tipo_movimentacao);
      if (filtros.data_inicio) params.append("data_inicio", filtros.data_inicio);
      if (filtros.data_fim) params.append("data_fim", filtros.data_fim);

      const response = await fetch(`/api/estoque/movimentacoes?${params}`);
      const data = await response.json();

      if (response.ok) {
        setDados(data);
      } else {
        toast.error(data.error || "Erro ao carregar movimentações");
      }
    } catch (error) {
      console.error("Erro ao carregar movimentações:", error);
      toast.error("Erro ao carregar movimentações");
    } finally {
      setCarregando(false);
    }
  };

  useEffect(() => {
    if (open) {
      setPaginaAtual(1);
      setFiltros({});
      setTermoBusca("");
      carregarDados();
    }
  }, [open, produtoId]);

  useEffect(() => {
    carregarDados();
  }, [paginaAtual, filtros]);

  // Busca com debounce (só se não tiver produto específico)
  useEffect(() => {
    if (produtoId) return; // Não buscar por nome se já temos um produto específico
    
    const timer = setTimeout(() => {
      if (termoBusca !== filtros.produto_nome) {
        setFiltros(prev => ({ ...prev, produto_nome: termoBusca }));
        setPaginaAtual(1);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [termoBusca, filtros.produto_nome, produtoId]);

  const handleFiltroChange = (key: keyof MovimentacoesFiltros, value: string | undefined) => {
    setFiltros(prev => ({ ...prev, [key]: value }));
    setPaginaAtual(1);
  };

  const formatarQuantidade = (quantidade: number) => {
    return new Intl.NumberFormat('pt-BR', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 3,
    }).format(quantidade);
  };

  const formatarData = (data: string) => {
    try {
      return format(new Date(data), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR });
    } catch {
      return "Data inválida";
    }
  };

  const getTipoIcon = (tipo: TipoMovimentacao) => {
    return tipo === 'ENTRADA' ? (
      <TrendingUp className="h-4 w-4 text-green-600" />
    ) : (
      <TrendingDown className="h-4 w-4 text-red-600" />
    );
  };

  const getTipoBadge = (tipo: TipoMovimentacao) => {
    return tipo === 'ENTRADA' ? (
      <Badge variant="default" className="bg-green-100 text-green-800 border-green-200">
        Entrada
      </Badge>
    ) : (
      <Badge variant="destructive" className="bg-red-100 text-red-800 border-red-200">
        Saída
      </Badge>
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Movimentações
            {produtoNome && (
              <span className="text-muted-foreground">- {produtoNome}</span>
            )}
          </DialogTitle>
          <DialogDescription>
            Visualize o histórico completo de entradas e saídas de estoque.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4 flex-1 overflow-hidden">
          {/* Filtros */}
          <div className="flex flex-col sm:flex-row gap-4">
            {!produtoId && (
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar produto..."
                  value={termoBusca}
                  onChange={(e) => setTermoBusca(e.target.value)}
                  className="pl-10"
                />
              </div>
            )}
            
            <Select
              value={filtros.tipo_movimentacao || "todos"}
              onValueChange={(value) => 
                handleFiltroChange("tipo_movimentacao", value === "todos" ? undefined : value)
              }
            >
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="todos">Todos</SelectItem>
                <SelectItem value="ENTRADA">Entradas</SelectItem>
                <SelectItem value="SAIDA">Saídas</SelectItem>
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Data início"
              value={filtros.data_inicio || ""}
              onChange={(e) => handleFiltroChange("data_inicio", e.target.value)}
              className="w-[150px]"
            />

            <Input
              type="date"
              placeholder="Data fim"
              value={filtros.data_fim || ""}
              onChange={(e) => handleFiltroChange("data_fim", e.target.value)}
              className="w-[150px]"
            />
          </div>

          {/* Tabela */}
          <div className="border rounded-md flex-1 overflow-auto">
            {carregando && !dados ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                      <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    {!produtoId && <TableHead>Produto</TableHead>}
                    <TableHead>Tipo</TableHead>
                    <TableHead className="text-center">Quantidade</TableHead>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Usuário</TableHead>
                    <TableHead>Observação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {dados?.data.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={produtoId ? 5 : 6} className="text-center py-8">
                        <div className="flex flex-col items-center gap-2">
                          <Calendar className="h-8 w-8 text-muted-foreground" />
                          <p className="text-muted-foreground">
                            Nenhuma movimentação encontrada
                          </p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    dados?.data.map((movimentacao) => (
                      <TableRow key={movimentacao.id}>
                        {!produtoId && (
                          <TableCell>
                            <div className="font-medium">
                              {movimentacao.produto?.nome || "Produto não encontrado"}
                            </div>
                          </TableCell>
                        )}
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            {getTipoIcon(movimentacao.tipo_movimentacao)}
                            {getTipoBadge(movimentacao.tipo_movimentacao)}
                          </div>
                        </TableCell>
                        
                        <TableCell className="text-center font-mono">
                          {formatarQuantidade(movimentacao.quantidade)}
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {formatarData(movimentacao.data_movimentacao)}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">
                              {movimentacao.usuario?.user_metadata?.full_name ||
                               movimentacao.usuario?.email ||
                               "Usuário não identificado"}
                            </span>
                          </div>
                        </TableCell>
                        
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {movimentacao.observacao || "-"}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Paginação */}
          {dados && dados.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <div className="text-sm text-muted-foreground">
                Mostrando {((dados.page - 1) * dados.pageSize) + 1} a{" "}
                {Math.min(dados.page * dados.pageSize, dados.total)} de{" "}
                {dados.total} movimentações
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={dados.page <= 1}
                  onClick={() => setPaginaAtual(prev => prev - 1)}
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={dados.page >= dados.totalPages}
                  onClick={() => setPaginaAtual(prev => prev + 1)}
                >
                  Próxima
                </Button>
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}