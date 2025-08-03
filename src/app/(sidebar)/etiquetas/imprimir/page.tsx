'use client';

import React, { useState } from 'react';
import { LabelTemplate, LabelType, LABEL_TYPES_CONFIG } from '@/lib/types/labels';
import { LabelPrintPreview } from '@/components/labels/LabelPrintPreview';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, FileText } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Mock templates - replace with actual data fetching
const mockTemplates: LabelTemplate[] = [
  {
    id: '1',
    name: 'Template Produto Aberto',
    label_type: LabelType.PRODUTO_ABERTO,
    paper_size: 'A4',
    labels_per_row: 2,
    labels_per_column: 4,
    label_width: 250,
    label_height: 150,
    margin_top: 20,
    margin_bottom: 20,
    margin_left: 20,
    margin_right: 20,
    gap_horizontal: 10,
    gap_vertical: 10,
    fields: [
      {
        id: 'field1',
        type: 'text',
        label: 'Produto',
        position: { x: 10, y: 10 },
        size: { width: 200, height: 25 },
        style: { fontSize: 14, fontWeight: 'bold', textAlign: 'left', color: '#000000' }
      },
      {
        id: 'field2',
        type: 'date',
        label: 'Data de Abertura',
        position: { x: 10, y: 45 },
        size: { width: 120, height: 20 },
        style: { fontSize: 12, fontWeight: 'normal', textAlign: 'left', color: '#000000' }
      },
      {
        id: 'field3',
        type: 'date',
        label: 'Validade',
        position: { x: 10, y: 75 },
        size: { width: 120, height: 20 },
        style: { fontSize: 12, fontWeight: 'normal', textAlign: 'left', color: '#000000' }
      },
      {
        id: 'field4',
        type: 'text',
        label: 'Responsável',
        position: { x: 10, y: 105 },
        size: { width: 150, height: 20 },
        style: { fontSize: 10, fontWeight: 'normal', textAlign: 'left', color: '#666666' }
      }
    ],
    organization_id: '',
    created_by: '',
    created_at: '',
    updated_at: ''
  }
];

export default function PrintLabelsPage() {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] = useState<LabelTemplate | null>(null);
  const [labelData, setLabelData] = useState<Record<string, string>>({});
  const [labelCount, setLabelCount] = useState(1);

  const handleTemplateSelect = (templateId: string) => {
    const template = mockTemplates.find(t => t.id === templateId);
    if (template) {
      setSelectedTemplate(template);
      // Initialize form data with template fields
      const initialData: Record<string, string> = {};
      template.fields.forEach(field => {
        if (field.type === 'date') {
          initialData[field.label] = new Date().toISOString().split('T')[0];
        } else {
          initialData[field.label] = '';
        }
      });
      setLabelData(initialData);
    }
  };

  const handleDataChange = (fieldLabel: string, value: string) => {
    setLabelData(prev => ({
      ...prev,
      [fieldLabel]: value
    }));
  };

  const getTemplatesByType = (type: LabelType) => {
    return mockTemplates.filter(template => template.label_type === type);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          onClick={() => router.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Imprimir Etiquetas</h1>
          <p className="text-gray-600">Selecione um template e preencha os dados para impressão</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Template Selection */}
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Selecionar Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(LABEL_TYPES_CONFIG).map(([labelType, config]) => {
                const typeTemplates = getTemplatesByType(labelType as LabelType);
                
                if (typeTemplates.length === 0) return null;
                
                return (
                  <div key={labelType}>
                    <div className="flex items-center gap-2 mb-2">
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <h3 className="font-medium text-sm">{config.name}</h3>
                    </div>
                    <div className="space-y-2">
                      {typeTemplates.map(template => (
                        <Button
                          key={template.id}
                          variant={selectedTemplate?.id === template.id ? "default" : "outline"}
                          className="w-full justify-start text-sm"
                          onClick={() => handleTemplateSelect(template.id)}
                        >
                          {template.name}
                        </Button>
                      ))}
                    </div>
                  </div>
                );
              })}
              
              {mockTemplates.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <p>Nenhum template disponível</p>
                  <Button 
                    variant="link" 
                    onClick={() => router.push('/etiquetas')}
                    className="mt-2"
                  >
                    Criar Template
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Input Form */}
          {selectedTemplate && (
            <Card>
              <CardHeader>
                <CardTitle>Dados da Etiqueta</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedTemplate.fields.map(field => (
                  <div key={field.id}>
                    <Label htmlFor={field.id}>{field.label}</Label>
                    {field.type === 'date' ? (
                      <Input
                        id={field.id}
                        type="date"
                        value={labelData[field.label] || ''}
                        onChange={(e) => handleDataChange(field.label, e.target.value)}
                      />
                    ) : field.type === 'temperature' ? (
                      <div className="flex items-center gap-2">
                        <Input
                          id={field.id}
                          type="number"
                          value={labelData[field.label]?.replace('°C', '') || ''}
                          onChange={(e) => handleDataChange(field.label, e.target.value)}
                          placeholder="0"
                        />
                        <span className="text-sm text-gray-500">°C</span>
                      </div>
                    ) : (
                      <Input
                        id={field.id}
                        type="text"
                        value={labelData[field.label] || ''}
                        onChange={(e) => handleDataChange(field.label, e.target.value)}
                        placeholder={`Digite ${field.label.toLowerCase()}`}
                      />
                    )}
                  </div>
                ))}
                
                <div>
                  <Label htmlFor="label-count">Quantidade de Etiquetas</Label>
                  <Input
                    id="label-count"
                    type="number"
                    min="1"
                    max="100"
                    value={labelCount}
                    onChange={(e) => setLabelCount(parseInt(e.target.value) || 1)}
                  />
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Preview */}
        <div className="lg:col-span-2">
          {selectedTemplate ? (
            <Card>
              <CardHeader>
                <CardTitle>Visualização</CardTitle>
              </CardHeader>
              <CardContent>
                <LabelPrintPreview
                  template={selectedTemplate}
                  data={labelData}
                  count={labelCount}
                />
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <div className="text-gray-400 mb-2">
                  Selecione um template para começar
                </div>
                <p className="text-sm text-gray-500">
                  Escolha um template na lista ao lado para visualizar e imprimir suas etiquetas
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
