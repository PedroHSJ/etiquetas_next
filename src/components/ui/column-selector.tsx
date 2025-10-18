"use client";

import { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Settings, GripVertical } from "lucide-react";

export interface Column {
  id: string;
  key: string;
  label: string;
  visible: boolean;
  fixed?: boolean;
  width?: number;
}

interface SortableColumnItemProps {
  column: Column;
  onToggle: (columnId: string) => void;
}

function SortableColumnItem({ column, onToggle }: SortableColumnItemProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: column.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  if (column.fixed) {
    return (
      <div className="bg-muted/30 flex items-center space-x-2 rounded p-2">
        <div className="h-4 w-4" /> {/* Espaço para o grip */}
        <Checkbox
          id={`column-${column.id}`}
          checked={column.visible}
          disabled
          className="data-[state=checked]:bg-muted-foreground"
        />
        <Label
          htmlFor={`column-${column.id}`}
          className="text-muted-foreground cursor-not-allowed text-sm font-medium"
        >
          {column.label}
        </Label>
        <span className="text-muted-foreground ml-auto text-xs">Fixa</span>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="hover:bg-muted/50 flex cursor-grab items-center space-x-2 rounded p-2 active:cursor-grabbing"
    >
      <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
        <GripVertical className="text-muted-foreground h-4 w-4" />
      </div>
      <Checkbox
        id={`column-${column.id}`}
        checked={column.visible}
        onCheckedChange={() => onToggle(column.id)}
      />
      <Label
        htmlFor={`column-${column.id}`}
        className="flex-1 cursor-pointer text-sm font-medium"
        onClick={() => onToggle(column.id)}
      >
        {column.label}
      </Label>
    </div>
  );
}

interface ColumnSelectorProps {
  columns: Column[];
  onColumnsChange: (columns: Column[]) => void;
  className?: string;
}

export function ColumnSelector({ columns, onColumnsChange, className }: ColumnSelectorProps) {
  const [open, setOpen] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const fixedColumns = columns.filter((col) => col.fixed);
  const activeColumns = columns.filter((col) => !col.fixed);

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = activeColumns.findIndex((col) => col.id === active.id);
      const newIndex = activeColumns.findIndex((col) => col.id === over.id);

      if (oldIndex !== -1 && newIndex !== -1) {
        const reorderedActiveColumns = arrayMove(activeColumns, oldIndex, newIndex);
        const newColumns = [...fixedColumns, ...reorderedActiveColumns];
        onColumnsChange(newColumns);
      }
    }
  };

  const handleToggleColumn = (columnId: string) => {
    const updatedColumns = columns.map((col) =>
      col.id === columnId ? { ...col, visible: !col.visible } : col
    );
    onColumnsChange(updatedColumns);
  };

  const visibleColumnsCount = columns.filter((col) => col.visible).length;
  const totalColumnsCount = columns.length;

  return (
    <div className={className}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm" className="gap-2">
            <Settings className="h-4 w-4" />
            Colunas ({visibleColumnsCount}/{totalColumnsCount})
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-0" align="end">
          <div className="p-4">
            <h4 className="mb-4 text-sm font-medium">Configurar Colunas</h4>

            {/* Colunas Fixas */}
            {fixedColumns.length > 0 && (
              <div className="mb-4">
                <h5 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Colunas Fixas
                </h5>
                <div className="space-y-1">
                  {fixedColumns.map((column) => (
                    <SortableColumnItem
                      key={column.id}
                      column={column}
                      onToggle={handleToggleColumn}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Colunas Ativas */}
            {activeColumns.length > 0 && (
              <div>
                <h5 className="text-muted-foreground mb-2 text-xs font-medium tracking-wide uppercase">
                  Colunas Ativas
                </h5>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragEnd={handleDragEnd}
                >
                  <SortableContext
                    items={activeColumns.map((col) => col.id)}
                    strategy={verticalListSortingStrategy}
                  >
                    <div className="space-y-1">
                      {activeColumns.map((column) => (
                        <SortableColumnItem
                          key={column.id}
                          column={column}
                          onToggle={handleToggleColumn}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
