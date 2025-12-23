"use client";

import React, { useState } from "react";
import { StorageLocation } from "@/types/models/storage-location";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronRight, ChevronDown, Plus, Pencil, Trash2, Folder, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { StorageLocationService } from "@/lib/services/client/storage-location-service";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface StorageLocationTreeProps {
  locations: StorageLocation[];
  onAddChild: (parent: StorageLocation) => void;
  onEdit: (location: StorageLocation) => void;
  onRefresh: () => void;
}

// Convert flat list to tree
function buildTree(locations: StorageLocation[]): StorageLocation[] {
  const map = new Map<string, StorageLocation & { children: StorageLocation[] }>();
  const roots: (StorageLocation & { children: StorageLocation[] })[] = [];

  // Initialize map
  locations.forEach((loc) => {
    map.set(loc.id, { ...loc, children: [] });
  });

  // Build hierarchy
  locations.forEach((loc) => {
    const node = map.get(loc.id)!;
    if (loc.parentId && map.has(loc.parentId)) {
      map.get(loc.parentId)!.children.push(node);
    } else {
      roots.push(node);
    }
  });

  return roots;
}

export function StorageLocationTree({
  locations,
  onAddChild,
  onEdit,
  onRefresh,
}: StorageLocationTreeProps) {
  const treeData = React.useMemo(() => buildTree(locations), [locations]);

  return (
    <div className="space-y-1">
      {treeData.map((node) => (
        <TreeNode
          key={node.id}
          node={node}
          level={0}
          onAddChild={onAddChild}
          onEdit={onEdit}
          onRefresh={onRefresh}
        />
      ))}
    </div>
  );
}

interface TreeNodeProps {
  node: StorageLocation & { children?: StorageLocation[] };
  level: number;
  onAddChild: (parent: StorageLocation) => void;
  onEdit: (location: StorageLocation) => void;
  onRefresh: () => void;
}

function TreeNode({ node, level, onAddChild, onEdit, onRefresh }: TreeNodeProps) {
  const [isOpen, setIsOpen] = useState(false);
  const hasChildren = node.children && node.children.length > 0;

  const handleDelete = async () => {
    try {
      if (hasChildren) {
        toast.error("Não é possível excluir um local que possui sub-locais.");
        return;
      }
      await StorageLocationService.deleteStorageLocation(node.id);
      toast.success("Local excluído com sucesso!");
      onRefresh();
    } catch (error) {
      toast.error("Erro ao excluir local.");
      console.error(error);
    }
  };

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="space-y-1">
      <div
        className={cn(
          "flex items-center justify-between p-2 rounded-md hover:bg-accent/50 group",
          "border border-transparent hover:border-border transition-colors"
        )}
        style={{ marginLeft: `${level * 24}px` }}
      >
        <div className="flex items-center gap-2 flex-1">
          {hasChildren ? (
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 p-0">
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </Button>
            </CollapsibleTrigger>
          ) : (
            <div className="w-6" />
          )}

          <div className="flex items-center gap-2">
            {level === 0 ? (
              <Folder className="h-4 w-4 text-blue-500" />
            ) : (
              <MapPin className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm font-medium">{node.name}</span>
            {node.description && (
              <span className="text-xs text-muted-foreground hidden md:inline-block">
                - {node.description}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Adicionar sub-local"
            onClick={() => onAddChild(node)}
          >
            <Plus className="h-3 w-3" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6"
            title="Editar"
            onClick={() => onEdit(node)}
          >
            <Pencil className="h-3 w-3" />
          </Button>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive hover:text-destructive/80">
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Excluir Localização</AlertDialogTitle>
                <AlertDialogDescription>
                  Você tem certeza que deseja excluir "{node.name}"? Esta ação não pode ser desfeita.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
                  Excluir
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      <CollapsibleContent>
        {node.children?.map((child) => (
          <TreeNode
            key={child.id}
            node={child}
            level={level + 1}
            onAddChild={onAddChild}
            onEdit={onEdit}
            onRefresh={onRefresh}
          />
        ))}
      </CollapsibleContent>
    </Collapsible>
  );
}
