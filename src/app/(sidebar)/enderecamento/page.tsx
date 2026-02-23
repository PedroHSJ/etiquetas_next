"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useStorageLocationsQuery } from "@/hooks/useStorageLocationsQuery";
import { useOrganization } from "@/contexts/OrganizationContext";
import { StorageLocationResponseDto } from "@/types/dto/storage-location";
import { StorageLocationTree } from "./StorageLocationTree";
import { StorageLocationForm } from "./StorageLocationForm";
import React from "react";

export const EnderecamentoIcon = () => {
  const themeColor = "#DC3545"; // Vermelho
  return (
    <svg
      viewBox="0 0 64 64"
      width="64"
      height="64"
      xmlns="http://www.w3.org/2000/svg"
    >
      <style>
        {`
          .pin { animation: pinJump 2s infinite ease-in-out; }
          .shadow { animation: shadowScale 2s infinite ease-in-out; transform-origin: 32px 46px; }
          @keyframes pinJump {
            0%, 100% { transform: translateY(0); }
            50% { transform: translateY(-6px); }
          }
          @keyframes shadowScale {
            0%, 100% { transform: scale(1); opacity: 1; }
            50% { transform: scale(0.6); opacity: 0.5; }
          }
        `}
      </style>
      <rect x="0" y="0" width="64" height="64" rx="18" fill="#EAEAEA" />
      <g fill="none">
        {/* Sombra com tom avermelhado */}
        <ellipse
          className="shadow"
          cx="32"
          cy="46"
          rx="5"
          ry="2"
          fill={themeColor}
          opacity="0.3"
        />
        <g
          className="pin"
          stroke={themeColor}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path
            d="M32 44C32 44 40 36 40 28C40 23.5817 36.4183 20 32 20C27.5817 20 24 23.5817 24 28C24 36 32 44 32 44Z"
            fill={themeColor}
            fillOpacity="0.1"
          />
          <circle cx="32" cy="28" r="3" fill={themeColor} />
        </g>
      </g>
    </svg>
  );
};
export default function StorageLocationsPage() {
  const { selectedOrganization } = useOrganization();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingLocation, setEditingLocation] = useState<
    StorageLocationResponseDto | undefined
  >(undefined);
  const [parentLocation, setParentLocation] = useState<
    StorageLocationResponseDto | undefined
  >(undefined);

  const {
    data: locations = [],
    isLoading,
    refetch,
  } = useStorageLocationsQuery({
    organizationId: selectedOrganization?.id,
    enabled: !!selectedOrganization?.id,
  });

  const handleCreateRoot = () => {
    setEditingLocation(undefined);
    setParentLocation(undefined);
    setIsFormOpen(true);
  };

  const handleCreateChild = (parent: StorageLocationResponseDto) => {
    setEditingLocation(undefined);
    setParentLocation(parent);
    setIsFormOpen(true);
  };

  const handleEdit = (location: StorageLocationResponseDto) => {
    setEditingLocation(location);
    setParentLocation(undefined); // Parent doesn't change on edit usually, or we need to look it up
    setIsFormOpen(true);
  };

  return (
    <div className="flex flex-col h-full bg-background">
      <header className="flex h-14 items-center gap-4 border-b bg-background px-6">
        <EnderecamentoIcon />
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
