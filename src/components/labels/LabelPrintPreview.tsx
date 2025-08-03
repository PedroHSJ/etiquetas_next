import React, { useRef } from 'react';
import { LabelTemplate, LabelField } from '@/lib/types/labels';
import { Button } from '@/components/ui/button';
import { Download, Printer } from 'lucide-react';
import { toast } from 'sonner';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

interface LabelPrintPreviewProps {
  template: LabelTemplate;
  data?: Record<string, string>;
  count?: number;
}

export const LabelPrintPreview: React.FC<LabelPrintPreviewProps> = ({
  template,
  data = {},
  count = 1
}) => {
  const printRef = useRef<HTMLDivElement>(null);

  const renderField = (field: LabelField) => {
    let value = data[field.label] || field.value || '';
    
    // Format values based on field type
    switch (field.type) {
      case 'date':
        if (value && value !== field.label) {
          try {
            value = new Date(value).toLocaleDateString('pt-BR');
          } catch {
            // Keep original value if date parsing fails
          }
        }
        break;
      case 'temperature':
        if (value && !value.includes('°C')) {
          value = `${value}°C`;
        }
        break;
    }

    const commonStyles = {
      position: 'absolute' as const,
      left: field.position.x,
      top: field.position.y,
      width: field.size.width,
      height: field.size.height,
      fontSize: field.style.fontSize,
      fontWeight: field.style.fontWeight,
      textAlign: field.style.textAlign,
      color: field.style.color,
      backgroundColor: field.style.backgroundColor || 'transparent',
      borderStyle: field.style.borderStyle || 'none',
      borderWidth: field.style.borderWidth || 0,
      borderColor: field.style.borderColor || 'transparent',
      display: 'flex',
      alignItems: 'center',
      padding: '2px',
      overflow: 'hidden',
    };

    switch (field.type) {
      case 'qrcode':
        return (
          <div key={field.id} style={commonStyles}>
            {value ? (
              <img 
                src={`https://api.qrserver.com/v1/create-qr-code/?size=${field.size.width}x${field.size.height}&data=${encodeURIComponent(value)}`}
                alt="QR Code"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                border: '2px dashed #ccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '10px',
                color: '#999'
              }}>
                QR Code
              </div>
            )}
          </div>
        );
      
      case 'barcode':
        return (
          <div key={field.id} style={commonStyles}>
            {value ? (
              <img 
                src={`https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(value)}&code=Code128&multiplebarcodes=false&translate-esc=false&unit=Fit&dpi=96&imagetype=Gif&rotation=0&color=%23000000&bgcolor=%23ffffff&fontsize=8&qunit=Mm`}
                alt="Barcode"
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <div style={{ 
                width: '100%', 
                height: '100%', 
                border: '2px dashed #ccc', 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                fontSize: '10px',
                color: '#999'
              }}>
                Código de Barras
              </div>
            )}
          </div>
        );
      
      default:
        return (
          <div key={field.id} style={commonStyles}>
            <span style={{ wordBreak: 'break-word' }}>
              {value || field.label}
            </span>
          </div>
        );
    }
  };

  const generateLabels = () => {
    const labels = [];
    for (let i = 0; i < count; i++) {
      labels.push(
        <div
          key={i}
          className="relative border border-gray-300 bg-white print:border-black"
          style={{
            width: template.label_width,
            height: template.label_height,
            marginBottom: template.gap_vertical,
            marginRight: i % template.labels_per_row === template.labels_per_row - 1 ? 0 : template.gap_horizontal,
            breakInside: 'avoid',
          }}
        >
          {template.fields.map(renderField)}
        </div>
      );
    }
    return labels;
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExportPDF = async () => {
    if (!printRef.current) return;

    try {
      toast.info('Gerando PDF...');
      
      const canvas = await html2canvas(printRef.current, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`etiquetas-${template.name.replace(/\s+/g, '-').toLowerCase()}.pdf`);
      
      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    }
  };

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex items-center gap-4 no-print">
        <Button onClick={handlePrint} className="flex items-center gap-2">
          <Printer className="w-4 h-4" />
          Imprimir
        </Button>
        
        <Button onClick={handleExportPDF} variant="outline" className="flex items-center gap-2">
          <Download className="w-4 h-4" />
          Exportar PDF
        </Button>
        
        <div className="text-sm text-gray-600">
          {count} etiqueta{count !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Print Area */}
      <div
        ref={printRef}
        className="bg-white p-8 border border-gray-200 print:border-none print:p-0"
        style={{
          paddingTop: template.margin_top,
          paddingBottom: template.margin_bottom,
          paddingLeft: template.margin_left,
          paddingRight: template.margin_right,
        }}
      >
        <div
          className="grid gap-0"
          style={{
            gridTemplateColumns: `repeat(${template.labels_per_row}, 1fr)`,
          }}
        >
          {generateLabels()}
        </div>
      </div>

      {/* Print Styles */}
      <style jsx>{`
        @media print {
          .no-print {
            display: none !important;
          }
          
          body {
            margin: 0;
            padding: 0;
          }
          
          .print\\:border-none {
            border: none !important;
          }
          
          .print\\:p-0 {
            padding: 0 !important;
          }
          
          .print\\:border-black {
            border-color: black !important;
          }
        }
      `}</style>
    </div>
  );
};
