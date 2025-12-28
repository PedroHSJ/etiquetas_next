"use client";

import { useOrganization } from "@/contexts/OrganizationContext";
import {
  OrganizationDetails,
  OrganizationSettings,
} from "@/components/organization";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Loader2, Building2, Settings, Eye } from "lucide-react";

export default function ConfiguracoesPage() {
  const {
    activeOrganizationDetails,
    detailsLoading,
    refreshActiveOrganization,
  } = useOrganization();

  if (detailsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-muted-foreground">
            Carregando informações da organização...
          </p>
        </div>
      </div>
    );
  }

  if (!activeOrganizationDetails) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Building2 className="h-12 w-12 text-muted-foreground" />
              <div className="text-center">
                <h3 className="text-lg font-medium">
                  Nenhuma organização selecionada
                </h3>
                <p className="text-sm text-muted-foreground">
                  Selecione uma organização no seletor acima para ver as
                  configurações.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold tracking-tight">
              Configurações da Organização
            </h1>
            {activeOrganizationDetails.type && (
              <Badge variant="secondary">
                {activeOrganizationDetails.type}
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground">
            Gerencie as informações e configurações de{" "}
            {activeOrganizationDetails.name}
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="visualizar" className="space-y-6">
        <TabsList>
          <TabsTrigger value="visualizar" className="flex items-center gap-2">
            <Eye className="h-4 w-4" />
            Visualizar
          </TabsTrigger>
          <TabsTrigger value="editar" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Editar
          </TabsTrigger>
        </TabsList>

        {/* Visualização */}
        <TabsContent value="visualizar" className="space-y-6">
          <OrganizationDetails
            organization={activeOrganizationDetails}
            variant="card"
            showAllDetails={true}
          />
        </TabsContent>

        {/* Edição */}
        <TabsContent value="editar" className="space-y-6">
          <OrganizationSettings
            organization={activeOrganizationDetails}
            onUpdate={(updatedOrg) => {
              // Atualizar o contexto local se necessário
              console.log("Organização atualizada:", updatedOrg);
              refreshActiveOrganization();
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
