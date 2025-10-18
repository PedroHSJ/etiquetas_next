import React, { useEffect, useRef } from "react";
import { useDraggable } from "@dnd-kit/core";
import { LabelField, LABEL_TYPES_CONFIG } from "@/types/etiquetas";
import { Product } from "@/types/products";
import { ProductSelector } from "@/components/products/ProductSelector";
import { GripVertical } from "lucide-react";
import { cn } from "@/lib/utils";
import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

interface DraggableFieldProps {
  field: LabelField;
  isSelected?: boolean;
  onSelect?: (field: LabelField) => void;
  onUpdate?: (field: LabelField) => void;
  isEditing?: boolean;
  products?: Product[];
  labelType?: string;
}

export const DraggableField: React.FC<DraggableFieldProps> = ({
  field,
  isSelected,
  onSelect,
  onUpdate,
  isEditing = false,
  products = [],
  labelType,
}) => {
  const qrRef = useRef<HTMLCanvasElement>(null);
  const barcodeRef = useRef<SVGSVGElement>(null);

  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: field.id,
    data: field,
  });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Generate QR Code
  useEffect(() => {
    if (field.type === "qrcode" && qrRef.current && field.value) {
      QRCode.toCanvas(qrRef.current, field.value, {
        width: Math.min(field.size.width - 4, field.size.height - 4),
        margin: 0,
      }).catch(console.error);
    }
  }, [field.type, field.value, field.size]);

  // Generate Barcode
  useEffect(() => {
    if (field.type === "barcode" && barcodeRef.current && field.value) {
      try {
        JsBarcode(barcodeRef.current, field.value, {
          width: 1,
          height: Math.max(20, field.size.height - 10),
          displayValue: false,
          margin: 0,
        });
      } catch (error) {
        console.error("Error generating barcode:", error);
      }
    }
  }, [field.type, field.value, field.size]);

  const handleFieldChange = (updates: Partial<LabelField>) => {
    if (onUpdate) {
      onUpdate({ ...field, ...updates });
    }
  };

  const renderFieldContent = () => {
    switch (field.type) {
      case "text":
        return (
          <div className="flex h-full w-full items-center">
            {isEditing ? (
              <input
                type="text"
                value={field.value || field.label}
                onChange={(e) => handleFieldChange({ value: e.target.value })}
                className="h-full w-full border-none bg-transparent text-inherit outline-none"
                style={{
                  fontSize: field.style.fontSize,
                  fontWeight: field.style.fontWeight,
                  textAlign: field.style.textAlign,
                  color: field.style.color,
                }}
              />
            ) : (
              <span>{field.value || field.label}</span>
            )}
          </div>
        );
      case "date":
        return (
          <div className="flex h-full w-full items-center">
            {isEditing ? (
              <input
                type="date"
                value={field.value || ""}
                onChange={(e) => handleFieldChange({ value: e.target.value })}
                className="h-full w-full border-none bg-transparent text-inherit outline-none"
                style={{
                  fontSize: field.style.fontSize,
                  fontWeight: field.style.fontWeight,
                  textAlign: field.style.textAlign,
                  color: field.style.color,
                }}
              />
            ) : (
              <span>
                {field.value ? new Date(field.value).toLocaleDateString("pt-BR") : field.label}
              </span>
            )}
          </div>
        );
      case "temperature":
        return (
          <div className="flex h-full w-full items-center">
            {isEditing ? (
              <div className="flex w-full">
                <input
                  type="number"
                  value={field.value?.replace("°C", "") || ""}
                  onChange={(e) => handleFieldChange({ value: `${e.target.value}°C` })}
                  className="flex-1 border-none bg-transparent text-inherit outline-none"
                  style={{
                    fontSize: field.style.fontSize,
                    fontWeight: field.style.fontWeight,
                    textAlign: field.style.textAlign,
                    color: field.style.color,
                  }}
                />
                <span>°C</span>
              </div>
            ) : (
              <span>{field.value || `${field.label}: ___°C`}</span>
            )}
          </div>
        );
      case "product":
        return (
          <div className="flex h-full w-full items-center">
            {isEditing ? (
              <ProductSelector
                products={products}
                selectedProduct={products.find((p) => p.id === field.value) || null}
                onProductSelect={(product) => handleFieldChange({ value: product.id })}
                trigger={
                  <div className="flex h-full w-full cursor-pointer items-center rounded border border-gray-300 px-2 hover:bg-gray-50">
                    <span className="truncate text-sm">
                      {products.find((p) => p.id === field.value)?.name || "Selecionar produto"}
                    </span>
                  </div>
                }
                placeholder="Selecionar produto"
              />
            ) : (
              <span>{products.find((p) => p.id === field.value)?.name || field.label}</span>
            )}
          </div>
        );
      case "quantity":
        return (
          <div className="flex h-full w-full items-center gap-2">
            {isEditing ? (
              <>
                <input
                  type="number"
                  value={field.value?.split(" ")[0] || ""}
                  onChange={(e) => {
                    const unit = field.value?.split(" ")[1] || "";
                    handleFieldChange({
                      value: `${e.target.value} ${unit}`.trim(),
                    });
                  }}
                  className="flex-1 border-none bg-transparent text-inherit outline-none"
                  style={{
                    fontSize: field.style.fontSize,
                    fontWeight: field.style.fontWeight,
                    textAlign: field.style.textAlign,
                    color: field.style.color,
                  }}
                  placeholder="0"
                />
                <input
                  type="text"
                  value={field.value?.split(" ")[1] || ""}
                  onChange={(e) => {
                    const quantity = field.value?.split(" ")[0] || "";
                    handleFieldChange({
                      value: `${quantity} ${e.target.value}`.trim(),
                    });
                  }}
                  className="w-16 border-none bg-transparent text-inherit outline-none"
                  style={{
                    fontSize: field.style.fontSize,
                    fontWeight: field.style.fontWeight,
                    color: field.style.color,
                  }}
                  placeholder="un"
                />
              </>
            ) : (
              <span>{field.value || `${field.label}: ___ un`}</span>
            )}
          </div>
        );
      case "label-type":
        return (
          <div className="flex h-full w-full items-center justify-center">
            <div
              className="rounded-full px-3 py-1 text-center font-bold text-white"
              style={{
                backgroundColor: labelType
                  ? LABEL_TYPES_CONFIG[labelType as keyof typeof LABEL_TYPES_CONFIG]?.color ||
                    "#6b7280"
                  : "#6b7280",
                fontSize: field.style.fontSize,
              }}
            >
              {labelType
                ? LABEL_TYPES_CONFIG[labelType as keyof typeof LABEL_TYPES_CONFIG]?.name ||
                  "Tipo da Etiqueta"
                : "Tipo da Etiqueta"}
            </div>
          </div>
        );
      case "qrcode":
        return (
          <div className="flex h-full w-full items-center justify-center">
            {isEditing ? (
              <div className="flex flex-col items-center gap-1">
                <input
                  type="text"
                  value={field.value || ""}
                  onChange={(e) => handleFieldChange({ value: e.target.value })}
                  placeholder="Dados do QR Code"
                  className="w-full rounded border border-gray-300 bg-transparent px-1 text-xs"
                />
                {field.value && <canvas ref={qrRef} className="max-h-full max-w-full" />}
              </div>
            ) : (
              <>
                {field.value ? (
                  <canvas ref={qrRef} className="max-h-full max-w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-xs text-gray-500">QR Code</span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      case "barcode":
        return (
          <div className="flex h-full w-full flex-col items-center justify-center">
            {isEditing ? (
              <div className="flex w-full flex-col items-center gap-1">
                <input
                  type="text"
                  value={field.value || ""}
                  onChange={(e) => handleFieldChange({ value: e.target.value })}
                  placeholder="Código de barras"
                  className="w-full rounded border border-gray-300 bg-transparent px-1 text-xs"
                />
                {field.value && <svg ref={barcodeRef} className="max-h-full max-w-full" />}
              </div>
            ) : (
              <>
                {field.value ? (
                  <svg ref={barcodeRef} className="max-h-full max-w-full" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center border-2 border-dashed border-gray-300">
                    <span className="text-xs text-gray-500">Código de Barras</span>
                  </div>
                )}
              </>
            )}
          </div>
        );
      default:
        return <span>{field.label}</span>;
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        left: field.position.x,
        top: field.position.y,
        width: field.size.width,
        height: field.size.height,
        fontSize: field.style.fontSize,
        fontWeight: field.style.fontWeight,
        textAlign: field.style.textAlign,
        color: field.style.color,
        backgroundColor: field.style.backgroundColor || "transparent",
        borderStyle: field.style.borderStyle || "solid",
        borderWidth: field.style.borderWidth || 1,
        borderColor: isSelected ? "#3b82f6" : field.style.borderColor || "#d1d5db",
      }}
      onClick={() => onSelect?.(field)}
      className={cn(
        "group absolute flex cursor-move items-center border",
        isSelected ? "border-2 border-blue-500" : "border-gray-300",
        isDragging ? "opacity-50" : "opacity-100"
      )}
      {...attributes}
      {...listeners}
    >
      {isSelected && (
        <div className="absolute -top-1 -left-1 h-3 w-3 cursor-move rounded-full border border-white bg-blue-500">
          <GripVertical className="h-2 w-2 text-white" />
        </div>
      )}

      <div className="h-full w-full overflow-hidden p-1">{renderFieldContent()}</div>

      {/* Resize handles */}
      {isSelected && (
        <>
          <div className="absolute -right-1 -bottom-1 h-3 w-3 cursor-se-resize rounded-full border border-white bg-blue-500" />
          <div className="absolute -top-1 -right-1 h-3 w-3 cursor-ne-resize rounded-full border border-white bg-blue-500" />
          <div className="absolute -bottom-1 -left-1 h-3 w-3 cursor-sw-resize rounded-full border border-white bg-blue-500" />
        </>
      )}
    </div>
  );
};
