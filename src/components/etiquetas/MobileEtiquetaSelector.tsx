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
import { ChevronLeft, ChevronRight, Printer, Search, Filter, X } from 'lucide-react';

interface MobileEtiquetaSelectorProps {
  onEtiquetaCreated?: () => void;
}

export function MobileEtiquetaSelector({ onEtiquetaCreated }: MobileEtiquetaSelectorProps) {
  const [selectedGrupo, setSelectedGrupo] = useState<Grupo | null>(null);
  const [selectedProduto, setSelectedProduto] = useState<Produto | null>(null);
  const [quantidade, setQuantidade] = useState(1);
  const [observacoes, setObservacoes] = useState('');
  const [step, setStep] = useState<'grupos' | 'produtos' | 'confirmacao'>('grupos');
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);
  
  const { 
    grupos, 
    produtos, 
    etiquetas, 
    loading, 
    error, 
    loadProdutosByGrupo, 
    createEtiqueta 
  } = useEtiquetas();
  
  const { toast } = useToast();

  // Filtrar grupos por busca
  const filteredGrupos = grupos.filter(grupo =>
    grupo.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (grupo.descricao && grupo.descricao.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  // Filtrar produtos por busca
  const filteredProdutos = produtos.filter(produto =>
    produto.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleGrupoSelect = async (grupo: Grupo) => {
    try {
      setSelectedGrupo(grupo);
      await loadProdutosByGrupo(grupo.id);
      setStep('produtos');
      setSearchTerm('');
      setShowSearch(false);
    } catch (error) {
      toast('Erro ao carregar produtos do grupo');
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
      setSearchTerm('');
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
      
      toast('Etiqueta criada com sucesso!');

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
      toast('Erro ao criar etiqueta');
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

      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.focus();
        
        setTimeout(() => {
          printWindow.print();
          printWindow.close();
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao imprimir:', error);
    }
  };

  const renderHeader = () => (
    <div className="sticky top-0 bg-background border-b z-10">
      <div className="flex items-center justify-between p-4">
        {step !== 'grupos' && (
          <Button variant="ghost" size="sm" onClick={handleBack}>
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        
        <h1 className="text-lg font-semibold flex-1 text-center">
          {step === 'grupos' && 'Grupos'}
          {step === 'produtos' && selectedGrupo?.nome}
          {step === 'confirmacao' && 'Confirmar'}
        </h1>
        
        {step === 'grupos' && (
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSearch(!showSearch)}
          >
            {showSearch ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
          </Button>
        )}
      </div>
      
      {/* Barra de busca */}
      {showSearch && step === 'grupos' && (
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar grupos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      )}
    </div>
  );

  const renderGrupos = () => (
    <div className="p-4 space-y-3">
      {filteredGrupos.map((grupo) => (
        <Card 
          key={grupo.id} 
          className="cursor-pointer active:scale-95 transition-transform"
          onClick={() => handleGrupoSelect(grupo)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <h3 className="font-semibold text-base">{grupo.nome}</h3>
                {grupo.descricao && (
                  <p className="text-sm text-muted-foreground mt-1">{grupo.descricao}</p>
                )}
              </div>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredGrupos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhum grupo encontrado' : 'Nenhum grupo disponível'}
        </div>
      )}
    </div>
  );

  const renderProdutos = () => (
    <div className="p-4 space-y-3">
      {/* Barra de busca para produtos */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar produtos..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>
      
      {filteredProdutos.map((produto) => (
        <Card 
          key={produto.id} 
          className="cursor-pointer active:scale-95 transition-transform"
          onClick={() => handleProdutoSelect(produto)}
        >
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-base">{produto.nome}</h3>
              <ChevronRight className="h-5 w-5 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      ))}
      
      {filteredProdutos.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {searchTerm ? 'Nenhum produto encontrado' : 'Nenhum produto disponível'}
        </div>
      )}
    </div>
  );

  const renderConfirmacao = () => (
    <div className="p-4 space-y-4">
      <Card>
        <CardContent className="p-4 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Grupo</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-semibold">{selectedGrupo?.nome}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium text-muted-foreground">Produto</Label>
            <div className="p-3 bg-muted rounded-lg">
              <p className="font-semibold">{selectedProduto?.nome}</p>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="quantidade">Quantidade</Label>
            <Input
              id="quantidade"
              type="number"
              min="1"
              value={quantidade}
              onChange={(e) => setQuantidade(parseInt(e.target.value) || 1)}
              className="text-center text-lg"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="observacoes">Observações (opcional)</Label>
            <Textarea
              id="observacoes"
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
              placeholder="Adicione observações se necessário..."
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
                Criar e Imprimir
              </>
            )}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  const renderEtiquetasRecentes = () => {
    if (etiquetas.length === 0) return null;

    return (
      <div className="p-4">
        <h3 className="font-semibold mb-3">Etiquetas Recentes</h3>
        <div className="space-y-2">
          {etiquetas.slice(0, 3).map((etiqueta) => (
            <div key={etiqueta.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm truncate">{etiqueta.produtos?.nome}</p>
                <p className="text-xs text-muted-foreground">{etiqueta.grupos?.nome}</p>
              </div>
              <div className="text-right ml-2">
                <Badge variant="secondary" className="text-xs">Qtd: {etiqueta.quantidade}</Badge>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(etiqueta.created_at).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (error) {
    return (
      <div className="p-4 text-center">
        <p className="text-destructive mb-4">{error}</p>
        <Button onClick={() => window.location.reload()}>Tentar Novamente</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {renderHeader()}
      
      <div className="flex-1">
        {step === 'grupos' && renderGrupos()}
        {step === 'produtos' && renderProdutos()}
        {step === 'confirmacao' && renderConfirmacao()}
      </div>
      
      {step === 'grupos' && renderEtiquetasRecentes()}
    </div>
  );
}
