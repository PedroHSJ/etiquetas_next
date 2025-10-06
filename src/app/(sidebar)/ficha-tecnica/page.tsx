"use client";

import React from "react";
import { TechnicalSheetGenerator } from "@/components/technical-sheet/TechnicalSheetGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Users, Clock, Calculator } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { TechnicalSheetResponse, EditableIngredient } from "@/types/technical-sheet";

export default function TechnicalSheetPage() {
  const { user } = useAuth();

  // Para desenvolvimento, usar um organizationId fixo
  // Em produção, isso viria do contexto da organização do usuário
  const organizationId = process.env.NODE_ENV === "development" 
    ? "development-org-id"
    : ""; // Aqui você implementaria a lógica para obter o organizationId real

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            Acesso não autorizado
          </h2>
          <p className="text-muted-foreground">
            Você precisa estar logado para acessar esta funcionalidade.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = (sheet: TechnicalSheetResponse & { ingredients: EditableIngredient[] }) => {
    // Aqui você pode implementar a lógica de salvamento
    // Por exemplo, salvar no banco de dados local ou enviar para uma API
    console.log("Ficha técnica para salvar:", sheet);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold tracking-tight">Ficha Técnica</h1>
        <p className="text-muted-foreground">
          Gere fichas técnicas detalhadas para seus pratos com quantidades precisas de ingredientes
          usando inteligência artificial.
        </p>
      </div>

      {/* Cards informativos */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">IA Assistida</CardTitle>
            <ChefHat className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">100%</div>
            <p className="text-xs text-muted-foreground">
              Automatizada com IA
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Porções</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1-1000</div>
            <p className="text-xs text-muted-foreground">
              Flexibilidade total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Cálculo</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Auto</div>
            <p className="text-xs text-muted-foreground">
              Quantidades proporcionais
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edição</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Manual</div>
            <p className="text-xs text-muted-foreground">
              Ajustes personalizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Instruções de uso */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
          <CardDescription>
            Siga estes passos para gerar sua ficha técnica
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">Digite o prato</h4>
                <p className="text-sm text-muted-foreground">
                  Informe o nome do prato e o número de porções desejado
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">Gere com IA</h4>
                <p className="text-sm text-muted-foreground">
                  A IA irá sugerir ingredientes e quantidades automaticamente
                </p>
              </div>
            </div>
            
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">Edite e salve</h4>
                <p className="text-sm text-muted-foreground">
                  Ajuste as quantidades conforme necessário e salve sua ficha
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente principal */}
      <TechnicalSheetGenerator
        organizationId={organizationId}
        onSave={handleSave}
      />
    </div>
  );
}