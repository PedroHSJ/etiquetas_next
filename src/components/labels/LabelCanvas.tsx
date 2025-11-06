import React, { useState } from "react";
import { useDroppable } from "@dnd-kit/core";
import { LabelField, LabelTemplate } from "@/types/etiquetas";
import { Product } from "@/types/stock/product";
import { DraggableField } from "./DraggableField";
import { cn } from "@/lib/utils";

interface LabelCanvasProps {
  template: LabelTemplate;
  onTemplateUpdate: (template: LabelTemplate) => void;
  isEditing?: boolean;
  showGrid?: boolean;
  products?: Product[];
}

export const LabelCanvas: React.FC<LabelCanvasProps> = ({
  template,
  onTemplateUpdate,
  isEditing = false,
  showGrid = true,
  products = [],
}) => {
  const [selectedField, setSelectedField] = useState<LabelField | null>(null);

  const { isOver, setNodeRef } = useDroppable({
    id: "canvas",
  });

  const handleFieldUpdate = (updatedField: LabelField) => {
    const updatedFields = template.fields.map((field) =>
      field.id === updatedField.id ? updatedField : field
    );

    onTemplateUpdate({
      ...template,
      fields: updatedFields,
    });
  };

  const handleFieldDelete = () => {
    if (!selectedField) return;

    const updatedFields = template.fields.filter(
      (field) => field.id !== selectedField.id
    );
    onTemplateUpdate({
      ...template,
      fields: updatedFields,
    });
    setSelectedField(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Delete" && selectedField) {
      handleFieldDelete();
    }
  };

  return (
    <div className="relative">
      <div
        ref={setNodeRef}
        className={cn(
          "relative border-2 border-dashed bg-white overflow-hidden",
          isOver ? "border-blue-500 bg-blue-50" : "border-gray-300",
          showGrid && "bg-grid-pattern"
        )}
        style={{
          width: template.label_width,
          height: template.label_height,
          backgroundImage: showGrid
            ? "linear-gradient(rgba(0,0,0,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(0,0,0,.1) 1px, transparent 1px)"
            : "none",
          backgroundSize: showGrid ? "10px 10px" : "auto",
        }}
        tabIndex={0}
        onKeyDown={handleKeyDown}
      >
        {/* Canvas guidelines */}
        {showGrid && (
          <>
            <div className="absolute top-0 left-1/2 w-px h-full bg-blue-200 opacity-50 pointer-events-none" />
            <div className="absolute left-0 top-1/2 w-full h-px bg-blue-200 opacity-50 pointer-events-none" />
          </>
        )}

        {/* Render fields */}
        {template.fields.map((field) => (
          <DraggableField
            key={field.id}
            field={field}
            isSelected={selectedField?.id === field.id}
            onSelect={setSelectedField}
            onUpdate={handleFieldUpdate}
            isEditing={isEditing}
            products={products}
            labelType={template.label_type}
          />
        ))}

        {/* Drop indicator */}
        {isOver && (
          <div className="absolute inset-0 bg-blue-100 bg-opacity-50 flex items-center justify-center pointer-events-none">
            <div className="bg-blue-500 text-white px-4 py-2 rounded-md">
              Solte aqui para adicionar campo
            </div>
          </div>
        )}
      </div>

      {/* Selected field info */}
      {selectedField && (
        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
          <h3 className="font-medium text-sm mb-2">Campo Selecionado</h3>
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block text-gray-600">Posição X:</label>
              <input
                type="number"
                value={selectedField.position.x}
                onChange={(e) =>
                  handleFieldUpdate({
                    ...selectedField,
                    position: {
                      ...selectedField.position,
                      x: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Posição Y:</label>
              <input
                type="number"
                value={selectedField.position.y}
                onChange={(e) =>
                  handleFieldUpdate({
                    ...selectedField,
                    position: {
                      ...selectedField.position,
                      y: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Largura:</label>
              <input
                type="number"
                value={selectedField.size.width}
                onChange={(e) =>
                  handleFieldUpdate({
                    ...selectedField,
                    size: {
                      ...selectedField.size,
                      width: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Altura:</label>
              <input
                type="number"
                value={selectedField.size.height}
                onChange={(e) =>
                  handleFieldUpdate({
                    ...selectedField,
                    size: {
                      ...selectedField.size,
                      height: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Tamanho da Fonte:</label>
              <input
                type="number"
                value={selectedField.style.fontSize}
                onChange={(e) =>
                  handleFieldUpdate({
                    ...selectedField,
                    style: {
                      ...selectedField.style,
                      fontSize: parseInt(e.target.value),
                    },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
            <div>
              <label className="block text-gray-600">Cor:</label>
              <input
                type="color"
                value={selectedField.style.color}
                onChange={(e) =>
                  handleFieldUpdate({
                    ...selectedField,
                    style: { ...selectedField.style, color: e.target.value },
                  })
                }
                className="w-full px-2 py-1 border rounded"
              />
            </div>
          </div>
          <button
            onClick={handleFieldDelete}
            className="mt-2 px-3 py-1 bg-red-500 text-white text-xs rounded hover:bg-red-600"
          >
            Excluir Campo
          </button>
        </div>
      )}
    </div>
  );
};
