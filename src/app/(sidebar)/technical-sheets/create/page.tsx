"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { NavigationButton } from "@/components/ui/navigation-button";
import { TechnicalSheetGenerator } from "@/components/technical-sheet/TechnicalSheetGenerator";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import {
  EditableIngredient,
  TechnicalSheetResponse,
} from "@/types/technical-sheet";
import { TechnicalSheetService } from "@/lib/services/client/technical-sheet-service";
import { CreateTechnicalSheetDto } from "@/types/dto/technical-sheet/request";
import { toast } from "sonner";
import { ArrowLeft, Calculator, ChefHat, Clock, Users } from "lucide-react";
import { WriteGuard } from "@/components/auth/PermissionGuard";

export default function TechnicalSheetCreatePage() {
  const router = useRouter();
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

  const handleSave = async (
    sheet: TechnicalSheetResponse & { ingredients: EditableIngredient[] },
  ) => {
    if (!selectedOrganization) {
      toast.error("Nenhuma organização selecionada");
      return;
    }

    setIsSaving(true);

    try {
      const saveData: CreateTechnicalSheetDto = {
        dishName: sheet.dishName,
        servings: sheet.servings,
        preparationTime: sheet.preparationTime,
        cookingTime: sheet.cookingTime,
        difficulty: sheet.difficulty,
        preparationSteps: sheet.preparationSteps,
        nutritionalInsights: sheet.nutritionalInsights,
        organizationId: selectedOrganization.id,
        ingredients: sheet.ingredients.map((ingredient, index) => ({
          ingredientName: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          originalQuantity:
            (ingredient as EditableIngredient).originalQuantity ||
            ingredient.quantity,
          productId: (ingredient as EditableIngredient).productId
            ? parseInt((ingredient as EditableIngredient).productId!, 10)
            : undefined,
          sortOrder: index,
        })),
      };

      await TechnicalSheetService.create(saveData);
      toast.success("Ficha técnica salva com sucesso!");
      router.push("/technical-sheets/list");
    } catch (error) {
      console.error("Erro inesperado ao salvar ficha técnica:", error);
      toast.error("Erro inesperado ao salvar ficha técnica");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <WriteGuard module="TECHNICAL_SHEETS">
      <div className="flex flex-1 flex-col gap-6">
        <div className="flex items-center gap-4">
          <NavigationButton
            href="/technical-sheets/list"
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
          </NavigationButton>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Nova Ficha Técnica</h1>
              <p className="text-muted-foreground">
                Gere e edite fichas técnicas com apoio de IA
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                IA Assistida
              </CardTitle>
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

        <Card>
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

        <TechnicalSheetGenerator
          organizationId={selectedOrganization.id}
          onSave={handleSave}
          isSaving={isSaving}
        />
      </div>
    </WriteGuard>
  );
}
