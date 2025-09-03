import React, { useState } from "react";
import {
  LabelType,
  LabelTemplate,
  LABEL_TYPES_CONFIG,
} from "@/lib/types/labels";
import { Product } from "@/lib/types/products";
import { LabelEditor } from "@/components/labels/LabelEditor";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Edit,
  Copy,
  Trash2,
  Download,
  Eye,
  Calendar,
  User,
  Printer,
} from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface TemplateManagerProps {
  templates?: LabelTemplate[];
  products?: Product[];
  onSaveTemplate?: (template: LabelTemplate) => void;
  onDeleteTemplate?: (templateId: string) => void;
}

export const TemplateManager: React.FC<TemplateManagerProps> = ({
  templates = [],
  products = [],
  onSaveTemplate,
  onDeleteTemplate,
}) => {
  const router = useRouter();
  const [selectedTemplate, setSelectedTemplate] =
    useState<LabelTemplate | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [selectedLabelType, setSelectedLabelType] = useState<LabelType | null>(
    null
  );
  const [isNewTemplateDialogOpen, setIsNewTemplateDialogOpen] = useState(false);

  const createNewTemplate = (labelType: LabelType) => {
    const config = LABEL_TYPES_CONFIG[labelType];

    const newTemplate: LabelTemplate = {
      id: "",
      name: `Novo Template - ${config.name}`,
      label_type: labelType,
      paper_size: "A4",
      labels_per_row: 1,
      labels_per_column: 1,
      label_width: 400,
      label_height: 200,
      margin_top: 20,
      margin_bottom: 20,
      margin_left: 20,
      margin_right: 20,
      gap_horizontal: 10,
      gap_vertical: 10,
      fields:
        config.defaultFields?.map((field, index) => ({
          id: `default_${index}`,
          type: field.type as any,
          label: field.label,
          position: { x: 20 + index * 30, y: 20 + index * 35 },
          size: { width: 120, height: 25 },
          style: {
            fontSize: 12,
            fontWeight: field.required ? "bold" : "normal",
            textAlign: "left",
            color: "#000000",
          },
        })) || [],
      organization_id: "",
      created_by: "",
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_default: false,
    };

    setSelectedTemplate(newTemplate);
    setIsNewTemplateDialogOpen(false);
    setIsEditorOpen(true);
  };

  const handleEditTemplate = (template: LabelTemplate) => {
    setSelectedTemplate(template);
    setIsEditorOpen(true);
  };

  const handleSaveTemplate = (template: LabelTemplate) => {
    onSaveTemplate?.(template);
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  const handleCloseEditor = () => {
    setIsEditorOpen(false);
    setSelectedTemplate(null);
  };

  const handleDuplicateTemplate = (template: LabelTemplate) => {
    const duplicatedTemplate: LabelTemplate = {
      ...template,
      id: "",
      name: `${template.name} (Cópia)`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_default: false,
    };

    setSelectedTemplate(duplicatedTemplate);
    setIsEditorOpen(true);
    toast.success("Template duplicado");
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (confirm("Tem certeza que deseja excluir este template?")) {
      onDeleteTemplate?.(templateId);
      toast.success("Template excluído");
    }
  };

  const getTemplatesByType = (type: LabelType) => {
    return templates.filter((template) => template.label_type === type);
  };

  if (isEditorOpen && selectedTemplate) {
    return (
      <LabelEditor
        initialTemplate={selectedTemplate}
        products={products}
        onSave={handleSaveTemplate}
        onClose={handleCloseEditor}
      />
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Gerenciar Templates de Etiquetas
        </h1>
        <p className="text-gray-600">
          Crie e gerencie templates personalizados para diferentes tipos de
          etiquetas alimentícias
        </p>
      </div>

      {/* Create New Template */}
      <div className="mb-8 flex items-center gap-4">
        <Dialog
          open={isNewTemplateDialogOpen}
          onOpenChange={setIsNewTemplateDialogOpen}
        >
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="w-4 h-4 mr-2" />
              Criar Novo Template
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Escolha o Tipo de Etiqueta</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              {Object.entries(LABEL_TYPES_CONFIG).map(([key, config]) => (
                <Card
                  key={key}
                  className="cursor-pointer hover:shadow-md transition-shadow"
                  onClick={() => createNewTemplate(key as LabelType)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: config.color }}
                      />
                      <h3 className="font-medium">{config.name}</h3>
                    </div>
                    <p className="text-sm text-gray-600 mb-3">
                      Template para etiquetas de {config.name.toLowerCase()}
                    </p>
                    <div className="text-xs text-gray-500">
                      {config.defaultFields?.length || 0} campos padrão
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </DialogContent>
        </Dialog>

        <Button
          variant="outline"
          onClick={() => router.push("/etiquetas/imprimir")}
          className="flex items-center gap-2"
        >
          <Printer className="w-4 h-4" />
          Imprimir Etiquetas
        </Button>
      </div>

      {/* Templates by Type */}
      <div className="space-y-8">
        {Object.entries(LABEL_TYPES_CONFIG).map(([labelType, config]) => {
          const typeTemplates = getTemplatesByType(labelType as LabelType);

          return (
            <div key={labelType}>
              <div className="flex items-center gap-3 mb-4">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: config.color }}
                />
                <h2 className="text-xl font-semibold">{config.name}</h2>
                <Badge variant="outline">
                  {typeTemplates.length} templates
                </Badge>
              </div>

              {typeTemplates.length === 0 ? (
                <Card className="border-dashed">
                  <CardContent className="p-8 text-center">
                    <div className="text-gray-400 mb-2">
                      Nenhum template encontrado para {config.name}
                    </div>
                    <Button
                      variant="outline"
                      onClick={() => createNewTemplate(labelType as LabelType)}
                    >
                      Criar Primeiro Template
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {typeTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className="hover:shadow-md transition-shadow"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-lg">
                            {template.name}
                          </CardTitle>
                          <Badge
                            style={{
                              backgroundColor: config.color,
                              color: "white",
                            }}
                          >
                            {config.name}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 text-sm text-gray-600 mb-4">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4" />
                            {template.label_width}x{template.label_height} px
                          </div>
                          <div className="flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            {template.fields.length} campos
                          </div>
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            Criado em{" "}
                            {new Date(template.created_at).toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEditTemplate(template)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDuplicateTemplate(template)}
                          >
                            <Copy className="w-4 h-4" />
                          </Button>

                          <Button size="sm" variant="outline">
                            <Download className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleDeleteTemplate(template.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
