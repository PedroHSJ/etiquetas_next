'use client';

import React from 'react';
import { Grupo, Produto } from '@/types/etiquetas';

interface EtiquetaPrinterProps {
  grupo: Grupo;
  produto: Produto;
  quantidade: number;
  observacoes?: string;
  onPrintComplete?: () => void;
}

export function EtiquetaPrinter({ 
  grupo, 
  produto, 
  quantidade, 
  observacoes, 
  onPrintComplete 
}: EtiquetaPrinterProps) {
  
  const printEtiqueta = async () => {
    try {
      // Criar conteúdo da etiqueta otimizado para impressão
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
            
            <div class="quantidade">Qtd: ${quantidade}</div>
            
            ${observacoes ? `<div class="observacoes">${observacoes}</div>` : '<div class="observacoes"></div>'}
            
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
          
          // Aguardar impressão e fechar janela
          setTimeout(() => {
            printWindow.close();
            onPrintComplete?.();
          }, 1000);
        }, 500);
      }
    } catch (error) {
      console.error('Erro ao imprimir etiqueta:', error);
      onPrintComplete?.();
    }
  };

  // Imprimir automaticamente quando o componente for montado
  React.useEffect(() => {
    printEtiqueta();
  }, []);

  return (
    <div className="text-center p-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
      <p className="text-sm text-muted-foreground">Preparando impressão...</p>
    </div>
  );
}

// Componente para visualizar a etiqueta antes da impressão
export function EtiquetaPreview({ 
  grupo, 
  produto, 
  quantidade, 
  observacoes 
}: Omit<EtiquetaPrinterProps, 'onPrintComplete'>) {
  
  return (
    <div className="border border-gray-300 rounded-lg p-4 bg-white max-w-xs mx-auto">
      <div className="text-center space-y-2">
        <div className="border-b border-gray-300 pb-2">
          <p className="text-xs font-bold text-gray-700 uppercase">{grupo.nome}</p>
        </div>
        
        <div className="py-2">
          <h3 className="text-sm font-bold text-black leading-tight">{produto.nome}</h3>
        </div>
        
        <div className="py-1">
          <p className="text-lg font-bold text-black">Qtd: {quantidade}</p>
        </div>
        
        {observacoes && (
          <div className="py-1">
            <p className="text-xs text-gray-600">{observacoes}</p>
          </div>
        )}
        
        <div className="h-8 bg-gray-100 border border-dashed border-gray-300 rounded flex items-center justify-center">
          <span className="text-xs text-gray-500">[CÓDIGO DE BARRAS]</span>
        </div>
        
        <div className="border-t border-gray-300 pt-2">
          <p className="text-xs text-gray-500">
            {new Date().toLocaleDateString('pt-BR')} {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
          </p>
        </div>
      </div>
    </div>
  );
}
