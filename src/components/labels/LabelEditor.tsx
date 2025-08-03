import React, { useState, useCallback } from 'react';
import { DndContext, DragEndEvent, DragOverEvent, closestCenter } from '@dnd-kit/core';
import { LabelType, LabelTemplate, LabelField, LABEL_TYPES_CONFIG } from '@/lib/types/labels';
import { FieldPalette } from './FieldPalette';
import { LabelCanvas } from './LabelCanvas';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Save, Download, Eye, Settings, Grid, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

interface LabelEditorProps {
  initialTemplate?: LabelTemplate;
  onSave?: (template: LabelTemplate) => void;
  onClose?: () => void;
}

export const LabelEditor: React.FC<LabelEditorProps> = ({
  initialTemplate,
  onSave,
  onClose
}) => {
  const [template, setTemplate] = useState<LabelTemplate>(
    initialTemplate || {
      id: '',
      name: '',
      label_type: LabelType.PRODUTO_ABERTO,
      paper_size: 'A4',
      labels_per_row: 1,
      labels_per_column: 1,
      label_width: 200,
      label_height: 100,
      margin_top: 20,
      margin_bottom: 20,
      margin_left: 20,
      margin_right: 20,
      gap_horizontal: 10,
      gap_vertical: 10,
      fields: [],
      organization_id: '',
      created_by: '',
      created_at: '',
      updated_at: ''
    }
  );

  const [showGrid, setShowGrid] = useState(true);
  const [isPreviewMode, setIsPreviewMode] = useState(false);
  const [activeTab, setActiveTab] = useState('design');

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (!over || over.id !== 'canvas') return;

    const activeData = active.data.current;
    
    if (activeData?.type === 'new-field') {
      // Add new field
      const newField: LabelField = {
        id: `field_${Date.now()}`,
        type: activeData.fieldType,
        label: activeData.label,
        position: { x: 50, y: 50 }, // Default position
        size: { width: 120, height: 30 },
        style: {
          fontSize: 12,
          fontWeight: 'normal',
          textAlign: 'left',
          color: '#000000',
        }
      };
      
      setTemplate(prev => ({
        ...prev,
        fields: [...prev.fields, newField]
      }));
      
      toast.success('Campo adicionado ao template');
    }
  }, []);

  const handleSave = () => {
    if (!template.name.trim()) {
      toast.error('Nome do template é obrigatório');
      return;
    }

    if (template.fields.length === 0) {
      toast.error('Adicione pelo menos um campo ao template');
      return;
    }

    const savedTemplate = {
      ...template,
      id: template.id || `template_${Date.now()}`,
      updated_at: new Date().toISOString()
    };

    onSave?.(savedTemplate);
    toast.success('Template salvo com sucesso!');
  };

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast.info('Funcionalidade de exportar PDF será implementada');
  };

  const clearTemplate = () => {
    setTemplate(prev => ({
      ...prev,
      fields: []
    }));
    toast.success('Template limpo');
  };

  return (
    <div className="h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-semibold">Editor de Etiquetas</h1>
            <div 
              className="px-3 py-1 rounded-full text-xs font-medium text-white"
              style={{ backgroundColor: LABEL_TYPES_CONFIG[template.label_type].color }}
            >
              {LABEL_TYPES_CONFIG[template.label_type].name}
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowGrid(!showGrid)}
            >
              <Grid className="w-4 h-4 mr-2" />
              Grade: {showGrid ? 'ON' : 'OFF'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsPreviewMode(!isPreviewMode)}
            >
              <Eye className="w-4 h-4 mr-2" />
              {isPreviewMode ? 'Editar' : 'Visualizar'}
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearTemplate}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Limpar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
            >
              <Download className="w-4 h-4 mr-2" />
              Exportar PDF
            </Button>
            
            <Button
              onClick={handleSave}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="w-4 h-4 mr-2" />
              Salvar Template
            </Button>
            
            {onClose && (
              <Button variant="outline" onClick={onClose}>
                Fechar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Field Palette */}
        {!isPreviewMode && (
          <FieldPalette labelType={template.label_type} />
        )}

        {/* Center - Canvas and Settings */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="design">Design</TabsTrigger>
              <TabsTrigger value="settings">Configurações</TabsTrigger>
            </TabsList>
            
            <TabsContent value="design" className="flex-1 p-6 overflow-auto">
              <div className="flex justify-center">
                <DndContext
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <LabelCanvas
                    template={template}
                    onTemplateUpdate={setTemplate}
                    isEditing={!isPreviewMode}
                    showGrid={showGrid}
                  />
                </DndContext>
              </div>
            </TabsContent>
            
            <TabsContent value="settings" className="flex-1 p-6 overflow-auto">
              <div className="max-w-2xl mx-auto space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Informações do Template</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="template-name">Nome do Template</Label>
                      <Input
                        id="template-name"
                        value={template.name}
                        onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Nome do template de etiqueta"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="label-type">Tipo de Etiqueta</Label>
                      <Select
                        value={template.label_type}
                        onValueChange={(value: LabelType) => 
                          setTemplate(prev => ({ ...prev, label_type: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.entries(LABEL_TYPES_CONFIG).map(([key, config]) => (
                            <SelectItem key={key} value={key}>
                              {config.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Dimensões da Etiqueta</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="label-width">Largura (px)</Label>
                        <Input
                          id="label-width"
                          type="number"
                          value={template.label_width}
                          onChange={(e) => setTemplate(prev => ({ 
                            ...prev, 
                            label_width: parseInt(e.target.value) || 200 
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="label-height">Altura (px)</Label>
                        <Input
                          id="label-height"
                          type="number"
                          value={template.label_height}
                          onChange={(e) => setTemplate(prev => ({ 
                            ...prev, 
                            label_height: parseInt(e.target.value) || 100 
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Layout de Impressão</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="paper-size">Tamanho do Papel</Label>
                      <Select
                        value={template.paper_size}
                        onValueChange={(value: 'A4' | 'CUSTOM') => 
                          setTemplate(prev => ({ ...prev, paper_size: value }))
                        }
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="A4">A4</SelectItem>
                          <SelectItem value="CUSTOM">Personalizado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="labels-per-row">Etiquetas por Linha</Label>
                        <Input
                          id="labels-per-row"
                          type="number"
                          min="1"
                          value={template.labels_per_row}
                          onChange={(e) => setTemplate(prev => ({ 
                            ...prev, 
                            labels_per_row: parseInt(e.target.value) || 1 
                          }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="labels-per-column">Etiquetas por Coluna</Label>
                        <Input
                          id="labels-per-column"
                          type="number"
                          min="1"
                          value={template.labels_per_column}
                          onChange={(e) => setTemplate(prev => ({ 
                            ...prev, 
                            labels_per_column: parseInt(e.target.value) || 1 
                          }))}
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};
