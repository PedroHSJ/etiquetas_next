import React from "react";
import { useDraggable } from "@dnd-kit/core";
import { LabelType, LABEL_TYPES_CONFIG } from "@/types/etiquetas";
import {
  Type,
  Calendar,
  Thermometer,
  QrCode,
  Barcode,
  FileText,
  User,
  Package,
  Hash,
  Tag,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface FieldPaletteProps {
  labelType: LabelType;
}

interface FieldType {
  type: string;
  label: string;
  icon: React.ReactNode;
  description: string;
}

interface DraggableFieldTypeProps {
  fieldType: FieldType;
}

const DraggableFieldType: React.FC<DraggableFieldTypeProps> = ({
  fieldType,
}) => {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `palette-${fieldType.type}-${fieldType.label}`,
      data: {
        type: "new-field",
        fieldType: fieldType.type,
        label: fieldType.label,
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg cursor-grab hover:bg-gray-50 transition-colors",
        isDragging && "opacity-50",
      )}
      {...attributes}
      {...listeners}
    >
      <div className="text-gray-600">{fieldType.icon}</div>
      <div className="flex-1">
        <div className="font-medium text-sm">{fieldType.label}</div>
        <div className="text-xs text-gray-500">{fieldType.description}</div>
      </div>
    </div>
  );
};

export const FieldPalette: React.FC<FieldPaletteProps> = ({ labelType }) => {
  const config = LABEL_TYPES_CONFIG[labelType];

  const commonFields: FieldType[] = [
    {
      type: "label-type",
      label: "Tipo da Etiqueta",
      icon: <Tag className="w-4 h-4" />,
      description: "Badge com o tipo da etiqueta",
    },
    {
      type: "product",
      label: "Produto",
      icon: <Package className="w-4 h-4" />,
      description: "Seletor de produto do catálogo",
    },
    {
      type: "quantity",
      label: "Quantidade",
      icon: <Hash className="w-4 h-4" />,
      description: "Quantidade e unidade de medida",
    },
    {
      type: "text",
      label: "Texto",
      icon: <Type className="w-4 h-4" />,
      description: "Campo de texto livre",
    },
    {
      type: "date",
      label: "Data",
      icon: <Calendar className="w-4 h-4" />,
      description: "Campo de data",
    },
    {
      type: "temperature",
      label: "Temperatura",
      icon: <Thermometer className="w-4 h-4" />,
      description: "Campo de temperatura em °C",
    },
    {
      type: "qrcode",
      label: "QR Code",
      icon: <QrCode className="w-4 h-4" />,
      description: "Código QR",
    },
    {
      type: "barcode",
      label: "Código de Barras",
      icon: <Barcode className="w-4 h-4" />,
      description: "Código de barras",
    },
  ];

  const specificFields: FieldType[] = [];

  // Adicionar campos específicos baseados no tipo de etiqueta
  if (config.defaultFields) {
    config.defaultFields.forEach((field) => {
      let icon = <FileText className="w-4 h-4" />;

      switch (field.label.toLowerCase()) {
        case "tipo da etiqueta":
          icon = <Tag className="w-4 h-4" />;
          break;
        case "produto":
          icon = <Package className="w-4 h-4" />;
          break;
        case "quantidade":
          icon = <Hash className="w-4 h-4" />;
          break;
        case "responsável":
          icon = <User className="w-4 h-4" />;
          break;
        case "data de abertura":
        case "data de manipulação":
        case "data de descongelamento":
        case "data da amostra":
        case "validade":
          icon = <Calendar className="w-4 h-4" />;
          break;
        case "temperatura":
          icon = <Thermometer className="w-4 h-4" />;
          break;
        case "lote":
          icon = <Barcode className="w-4 h-4" />;
          break;
        default:
          icon = <FileText className="w-4 h-4" />;
      }

      specificFields.push({
        type: field.type,
        label: field.label,
        icon,
        description: `Campo específico para ${config.name.toLowerCase()}`,
      });
    });
  }

  return (
    <div className="w-80 bg-gray-50 p-4 border-r border-gray-200 overflow-y-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Campos Disponíveis</h2>
        <p className="text-sm text-gray-600">
          Arraste os campos para a etiqueta para adicionar
        </p>
      </div>

      {specificFields.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-3">
            Campos para {config.name}
          </h3>
          <div className="space-y-2">
            {specificFields.map((field, index) => (
              <DraggableFieldType key={`specific-${index}`} fieldType={field} />
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Campos Gerais
        </h3>
        <div className="space-y-2">
          {commonFields.map((field, index) => (
            <DraggableFieldType key={`common-${index}`} fieldType={field} />
          ))}
        </div>
      </div>

      <div className="mt-6 p-3 bg-blue-50 rounded-lg">
        <h4 className="text-sm font-medium text-blue-800 mb-1">Dica</h4>
        <p className="text-xs text-blue-600">
          Após adicionar um campo, clique nele para personalizar posição,
          tamanho e estilo.
        </p>
      </div>
    </div>
  );
};
