'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useEtiquetas } from '@/hooks/useEtiquetas';
import { Grupo, Produto, EtiquetaCreate } from '@/types/etiquetas';
import { ChevronLeft, ChevronRight, Printer, Plus, X } from 'lucide-react';

interface EtiquetaSelectorProps {
  onEtiquetaCreated?: () => void;
}

export function EtiquetaSelector({ onEtiquetaCreated }: EtiquetaSelectorProps) {
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [step, setStep] = useState<'grupos' | 'produtos' | 'confirmacao'>('grupos');
  
  const { toast } = useToast();
  const { 
    grupos, 
    produtos, 
    loading, 
    loadProdutosByGrupo, 
    createEtiqueta 
  } = useEtiquetas();



  const handleGrupoSelect = async (grupo: Grupo) => {
    try {
      setSelectedGrupo(grupo);
      await loadProdutosByGrupo(grupo.id);
      setStep('produtos');
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao carregar produtos do grupo',
        variant: 'destructive',
      });
    }
  };

  const handleProdutoSelect = (produto: Produto) => {
    setSelectedProduto(produto);
    setStep('confirmacao');
  };

  const handleBack = () => {
    if (step === 'produtos') {
      setStep('grupos');
      setSelectedGrupo(null);
      setProdutos([]);
    } else if (step === 'confirmacao') {
      setStep('produtos');
      setSelectedProduto(null);
    }
  };

  const handleCreateEtiqueta = async () => {
    if (!selectedGrupo || !selectedProduto) return;

    try {
      const etiquetaData: EtiquetaCreate = {
        grupo_id: selectedGrupo.id,
        produto_id: selectedProduto.id,
        quantidade,
        observacoes: observacoes.trim() || undefined,
      };

      await createEtiqueta(etiquetaData);
      
      toast({
        title: 'Sucesso',
        description: 'Etiqueta criada com sucesso!',
      });

      // Imprimir etiqueta
      await printEtiqueta(selectedGrupo, selectedProduto, quantidade, observacoes);
      
      // Resetar estado
      setSelectedGrupo(null);
      setSelectedProduto(null);
      setQuantidade(1);
      setObservacoes('');
      setStep('grupos');
      
      onEtiquetaCreated?.();
    } catch (error) {
      toast({
        title: 'Erro',
        description: 'Erro ao criar etiqueta',
        variant: 'destructive',
      });
    }
  };

  const printEtiqueta = async (
    grupo: Grupo, 
    produto: Produto, 
    qtd: number, 
    obs?: string
  ) => {
    try {
      // Usar o componente de impressão avançado
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>Etiqueta - ${produto.nome}</title>
          <style>
            @media print {
              @page {
                margin: 0;
                size: 50mm 30mm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            
            body {
              font-family: Arial, sans-serif;
              margin: 0;
              padding: 0;
              background: white;
            }
            
            .etiqueta {
              width: 50mm;
              height: 30mm;
              padding: 2mm;
              box-sizing: border-box;
              display: flex;
              flex-direction: column;
              justify-content: space-between;
              border: 1px solid #ccc;
            }
            
            .header {
              text-align: center;
              border-bottom: 1px solid #333;
              padding-bottom: 1mm;
              margin-bottom: 1mm;
            }
            
            .grupo {
              font-size: 8pt;
              font-weight: bold;
              color: #333;
              margin: 0;
            }
            
            .produto {
              font-size: 10pt;
              font-weight: bold;
              color: #000;
              margin: 2mm 0;
              text-align: center;
              line-height: 1.2;
            }
            
            .quantidade {
              font-size: 12pt;
              font-weight: bold;
              color: #000;
              text-align: center;
              margin: 1mm 0;
            }
            
            .observacoes {
              font-size: 7pt;
              color: #666;
              text-align: center;
              margin: 1mm 0;
              min-height: 4mm;
            }
            
            .footer {
              text-align: center;
              font-size: 6pt;
              color: #999;
              border-top: 1px solid #ccc;
              padding-top: 1mm;
              margin-top: 1mm;
            }
            
            .barcode-area {
              height: 8mm;
              background: #f0f0f0;
              border: 1px dashed #ccc;
              display: flex;
              align-items: center;
              justify-content: center;
              margin: 1mm 0;
              font-size: 6pt;
              color: #666;
            }
          </style>
        </head>
        <body>
          <div class="etiqueta">
            <div class="header">
              <p class="grupo">${grupo.nome}</p>
            </div>
            
            <div class="produto">${produto.nome}</div>
            
            <div class="quantidade">Qtd: ${qtd}</div>
            
            ${obs ? `<div class="observacoes">${obs}</div>` : '<div class="observacoes"></div>'}
            
            <div class="barcode-area">
              [CÓDIGO DE BARRAS]
            </div>
            
            <div class="footer">
              ${new Date().toLocaleDateString('pt-BR')} ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
            </div>
          </div>
        </body>
        </html>
      `;

      // Abrir janela de impressão
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        // Aguardar carregamento e imprimir
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  };

  const renderGrupos = () => (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {grupos.map((grupo) => (
          <Card 
            key={grupo.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleGrupoSelect(grupo)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{grupo.nome}</h3>
              {grupo.descricao && (
                <p className="text-sm text-muted-foreground mt-1">{grupo.descricao}</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderProdutos = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Produtos - {selectedGrupo?.nome}</h2>
      </div>
      
      <div className="grid grid-cols-1 gap-3">
        {produtos.map((produto) => (
          <Card 
            key={produto.id} 
            className="cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => handleProdutoSelect(produto)}
          >
            <CardContent className="p-4">
              <h3 className="font-semibold text-lg">{produto.nome}</h3>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );

  const renderConfirmacao = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <Button variant="ghost" size="sm" onClick={handleBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold">Confirmar Etiqueta</h2>
      </div>

      <Card>
        <CardContent className="p-4 space-y-4">
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Grupo</Label>
            <p className="text-lg font-semibold">{selectedGrupo?.nome}</p>
          </div>
          
          <Separator />
          
          <div>
            <Label className="text-sm font-medium text-muted-foreground">Produto</Label>
            <p className="text-lg font-semibold">{selectedProduto?.nome}</p>
          </div>
          
          <Separator />
          
          <div>
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              className="mt-1"
            />
          </div>
          
          <div>
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações se necessário..."
              className="mt-1"
              rows={3}
            />
          </div>
          
          <Button 
            onClick={handleCreateEtiqueta} 
            disabled={loading}
            className="w-full"
            size="lg"
          >
            {loading ? (
              'Criando...'
            ) : (
              <>
                <Printer className="h-4 w-4 mr-2" />
                Criar e Imprimir Etiqueta
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-6">
      <div className="text-center space-y-2">
        <h1 className="text-2xl font-bold">Sistema de Etiquetas</h1>
        <p className="text-muted-foreground">
          Selecione um grupo e produto para criar uma etiqueta
        </p>
      </div>

      {/* Indicador de progresso */}
      <div className="flex items-center justify-center gap-2">
        <div className={`w-3 h-3 rounded-full ${step === 'grupos' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 'produtos' ? 'bg-primary' : 'bg-muted'}`} />
        <div className={`w-3 h-3 rounded-full ${step === 'confirmacao' ? 'bg-primary' : 'bg-muted'}`} />
      </div>

      {/* Conteúdo principal */}
      <Card>
        <CardHeader>
          <CardTitle className="text-center">
            {step === 'grupos' && 'Selecione um Grupo'}
            {step === 'produtos' && 'Selecione um Produto'}
            {step === 'confirmacao' && 'Confirme os Dados'}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {step === 'grupos' && renderGrupos()}
          {step === 'produtos' && renderProdutos()}
          {step === 'confirmacao' && renderConfirmacao()}
        </CardContent>
      </Card>

      {/* Histórico de etiquetas recentes */}
      <EtiquetasRecentes />
    </div>
  );
}

// Componente para mostrar etiquetas recentes
function EtiquetasRecentes() {
  const { etiquetas, loading } = useEtiquetas();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Etiquetas Recentes</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Carregando...</div>
        </CardContent>
      </Card>
    );
  }

  if (etiquetas.length === 0) {
    return null;
  }

  const recentEtiquetas = etiquetas.slice(0, 5); // Últimas 5 etiquetas

  return (
    <Card>
      <CardHeader>
        <CardTitle>Etiquetas Recentes</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {recentEtiquetas.map((etiqueta) => (
                           <div key={etiqueta.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                 <div>
                   <p className="font-medium">{etiqueta.produtos?.nome}</p>
                   <p className="text-sm text-muted-foreground">{etiqueta.grupos?.nome}</p>
                 </div>
              <div className="text-right">
                <Badge variant="secondary">Qtd: {etiqueta.quantidade}</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(etiqueta.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
