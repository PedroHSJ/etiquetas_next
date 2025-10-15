"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Package, 
  PlusCircle, 
  BarChart3, 
  History,
  AlertTriangle,
  TrendingUp 
} from "lucide-react";

import { EstoqueTable } from "@/components/estoque/EstoqueTable";
import { EstoqueStats } from "@/components/estoque/EstoqueStats";
import { EntradaRapidaDialog } from "@/components/estoque/EntradaRapidaDialog";
import { MovimentacoesDialog } from "@/components/estoque/MovimentacoesDialog";

import { EstoqueEstatisticas } from "@/types/estoque";
import { toast } from "sonner";

export default function EstoquePage() {
  const [estatisticas, setEstatisticas] = useState<EstoqueEstatisticas | null>(null);
  const [carregandoStats, setCarregandoStats] = useState(true);
  const [movimentacoesDialog, setMovimentacoesDialog] = useState({
    open: false,
    produtoId: undefined as number | undefined,
    produtoNome: undefined as string | undefined,
  });

  const carregarEstatisticas = async () => {
    setCarregandoStats(true);
    try {
      // Por enquanto, vamos simular as estatísticas
      // Em uma implementação real, você criaria um endpoint específico
      const response = await fetch('/api/estoque?page=1&pageSize=1');
      const data = await response.json();
      
      if (response.ok) {
        // Estatísticas simuladas baseadas nos dados retornados
        const stats: EstoqueEstatisticas = {
          total_produtos: data.total || 0,
          produtos_em_estoque: Math.floor((data.total || 0) * 0.8), // 80% simulado
          produtos_zerados: Math.floor((data.total || 0) * 0.1), // 10% simulado
          produtos_baixo_estoque: Math.floor((data.total || 0) * 0.1), // 10% simulado
          ultima_atualizacao: new Date().toISOString(),
        };
        setEstatisticas(stats);
      }
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast.error('Erro ao carregar estatísticas do estoque');
    } finally {
      setCarregandoStats(false);
    }
  };

  useEffect(() => {
    carregarEstatisticas();
  }, []);

  const handleViewMovimentacoes = (produtoId: number, produtoNome: string) => {
    setMovimentacoesDialog({
      open: true,
      produtoId,
      produtoNome,
    });
  };

  const handleSuccessEntrada = () => {
    // Recarregar estatísticas após uma entrada bem-sucedida
    carregarEstatisticas();
  };

  return (
    <div className="flex-1 space-y-6 p-6">
      {/* Cabeçalho */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Controle de Estoque</h1>
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
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={() => setMovimentacoesDialog({ open: true, produtoId: undefined, produtoNome: undefined })}
          >
            <History className="h-4 w-4" />
            Ver Todas as Movimentações
          </Button>
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Estoque de Produtos
              </CardTitle>
              <CardDescription>
                Visualize e gerencie o estoque atual de todos os produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <EstoqueTable onViewMovimentacoes={handleViewMovimentacoes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="movimentacoes" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Histórico de Movimentações
              </CardTitle>
              <CardDescription>
                Acompanhe todas as entradas e saídas de estoque
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <History className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Visualizar Movimentações</h3>
                <p className="text-muted-foreground mb-4">
                  Clique no botão abaixo para ver o histórico completo de movimentações
                </p>
                <Button 
                  onClick={() => setMovimentacoesDialog({ 
                    open: true, 
                    produtoId: undefined, 
                    produtoNome: undefined 
                  })}
                  className="gap-2"
                >
                  <History className="h-4 w-4" />
                  Abrir Histórico
                </Button>
              </div>
            </CardContent>
          </Card>
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
                    {estatisticas?.produtos_zerados || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    produtos em falta
                  </p>
                  {(estatisticas?.produtos_zerados || 0) > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => {
                        // Implementar navegação para filtro de produtos zerados
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
                    {estatisticas?.produtos_baixo_estoque || 0}
                  </div>
                  <p className="text-sm text-muted-foreground mt-1">
                    produtos com estoque baixo
                  </p>
                  {(estatisticas?.produtos_baixo_estoque || 0) > 0 && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-3"
                      onClick={() => {
                        // Implementar navegação para filtro de estoque baixo
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

      {/* Dialog de Movimentações */}
      <MovimentacoesDialog
        open={movimentacoesDialog.open}
        onOpenChange={(open) => setMovimentacoesDialog(prev => ({ ...prev, open }))}
        produtoId={movimentacoesDialog.produtoId}
        produtoNome={movimentacoesDialog.produtoNome}
      />
    </div>
  );
}