"use client";

import React, { useState } from "react";
import { TechnicalSheetGenerator } from "@/components/technical-sheet/TechnicalSheetGenerator";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChefHat, Users, Clock, Calculator } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { TechnicalSheetResponse, EditableIngredient } from "@/types/technical-sheet";
import { TechnicalSheetService, SaveTechnicalSheetData } from "@/lib/services/technicalSheetService";
import { toast } from "sonner";

export default function TechnicalSheetPage() {
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();
  const [isSaving, setIsSaving] = useState(false);

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

  if (!selectedOrganization) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-muted-foreground mb-2">
            Nenhuma organização selecionada
          </h2>
          <p className="text-muted-foreground">
            Selecione uma organização para criar fichas técnicas.
          </p>
        </div>
      </div>
    );
  }

  const handleSave = async (sheet: TechnicalSheetResponse & { ingredients: EditableIngredient[] }) => {
    if (!selectedOrganization) {
      toast.error("Nenhuma organização selecionada");
      return;
    }

    setIsSaving(true);

    try {
      // Preparar dados para salvamento
      const saveData: SaveTechnicalSheetData = {
        nome_prato: sheet.dishName,
        numero_porcoes: sheet.servings,
        tempo_preparo: sheet.preparationTime,
        tempo_cozimento: sheet.cookingTime,
        dificuldade: sheet.difficulty,
        etapas_preparo: sheet.preparationSteps,
        informacoes_nutricionais: sheet.nutritionalInsights,
        organizacao_id: selectedOrganization.id,
        ingredientes: sheet.ingredients.map((ingredient, index) => ({
          nome_ingrediente: ingredient.name,
          quantidade: ingredient.quantity,
          unidade: ingredient.unit,
          quantidade_original: (ingredient as EditableIngredient).originalQuantity || ingredient.quantity,
          produto_id: (ingredient as EditableIngredient).productId ? parseInt((ingredient as EditableIngredient).productId!) : undefined,
          ordem: index
        }))
      };

      // Salvar no banco de dados
      const result = await TechnicalSheetService.saveTechnicalSheet(saveData);

      if (result.success) {
        toast.success("Ficha técnica salva com sucesso!");
        console.log("Ficha técnica salva:", result.data);
      } else {
        toast.error(result.error || "Erro ao salvar ficha técnica");
        console.error("Erro ao salvar ficha técnica:", result.error);
      }

    } catch (error) {
      console.error("Erro inesperado ao salvar ficha técnica:", error);
      toast.error("Erro inesperado ao salvar ficha técnica");
    } finally {
      setIsSaving(false);
    }
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
        organizationId={selectedOrganization.id}
        onSave={handleSave}
      />
    </div>
  );
}