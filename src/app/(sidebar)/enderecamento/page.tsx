"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStorageLocationsQuery } from "@/hooks/useStorageLocationsQuery";
import { useOrganization } from "@/contexts/OrganizationContext";
import { StorageLocation } from "@/types/models/storage-location";
import { StorageLocationTree } from "./StorageLocationTree";
import { StorageLocationForm } from "./StorageLocationForm";

export default function StorageLocationsPage() {
  const { selectedOrganization } = useOrganization();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<StorageLocation | undefined>(undefined);
  const [parentLocation, setParentLocation] = useState<StorageLocation | undefined>(undefined);

  const { data: locations = [], isLoading, refetch } = useStorageLocationsQuery({
    organizationId: selectedOrganization?.id,
    enabled: !!selectedOrganization?.id,
  });

  const handleCreateRoot = () => {
    setEditingLocation(undefined);
    setParentLocation(undefined);
    setIsFormOpen(true);
  };

  const handleCreateChild = (parent: StorageLocation) => {
    setEditingLocation(undefined);
    setParentLocation(parent);
    setIsFormOpen(true);
  };

  const handleEdit = (location: StorageLocation) => {
    setEditingLocation(location);
    setParentLocation(undefined); // Parent doesn't change on edit usually, or we need to look it up
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <h1 className="text-xl font-semibold">Endereçamento Físico</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button onClick={handleCreateRoot} size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Nova Área
          </Button>
        </div>
      </header>

      <main className="flex-1 p-6 overflow-auto">
        {isLoading ? (
          <div>Carregando...</div>
        ) : locations.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
            <p>Nenhum local cadastrado.</p>
            <Button variant="link" onClick={handleCreateRoot}>
              Criar primeiro local
            </Button>
          </div>
        ) : (
          <StorageLocationTree
            locations={locations}
            onAddChild={handleCreateChild}
            onEdit={handleEdit}
            onRefresh={refetch}
          />
        )}
      </main>

      <StorageLocationForm
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        organizationId={selectedOrganization?.id}
        editingLocation={editingLocation}
        parentLocation={parentLocation}
        onSuccess={() => {
          setIsFormOpen(false);
          refetch();
        }}
      />
    </div>
  );
}
