"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ChefHat } from "lucide-react";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { NavigationButton } from "@/components/ui/navigation-button";
import { useAuth } from "@/contexts/AuthContext";
import { useOrganization } from "@/contexts/OrganizationContext";
import { TechnicalSheetModel } from "@/types/models/technical-sheet";
import { TechnicalSheetService } from "@/lib/services/client/technical-sheet-service";
import { TechnicalSheetGenerator } from "@/components/technical-sheet/TechnicalSheetGenerator";
import { EditableIngredient, TechnicalSheetResponse } from "@/types/technical-sheet";

export default function EditTechnicalSheetPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { selectedOrganization } = useOrganization();

  const [technicalSheet, setTechnicalSheet] = useState<TechnicalSheetModel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchSheet = async () => {
      if (!selectedOrganization || !id) return;

      try {
        const sheet = await TechnicalSheetService.getById(
          id as string,
          selectedOrganization.id
        );
        if (sheet.active === false) {
          toast.error("Ficha técnica inativa");
          router.push("/technical-sheets/list");
          return;
        }
        setTechnicalSheet(sheet);
      } catch (error) {
        console.error("Erro ao carregar ficha técnica:", error);
        toast.error("Ficha técnica não encontrada");
        router.push("/technical-sheets/list");
      } finally {
        setLoading(false);
      }
    };

    fetchSheet();
  }, [id, selectedOrganization, router]);

  const handleSave = async (
    sheet: TechnicalSheetResponse & { ingredients: EditableIngredient[] }
  ) => {
    if (!selectedOrganization) {
      toast.error("Nenhuma organização selecionada");
      return;
    }

    setSaving(true);

    try {
      await TechnicalSheetService.update(id as string, {
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
          originalQuantity: ingredient.originalQuantity,
          productId: ingredient.productId ? parseInt(ingredient.productId, 10) : undefined,
          sortOrder: index,
        })),
      });

      toast.success("Ficha técnica atualizada com sucesso!");
      router.push("/technical-sheets/list");
    } catch (error) {
      console.error("Erro inesperado ao salvar ficha técnica:", error);
      toast.error("Erro inesperado ao salvar ficha técnica");
    } finally {
      setSaving(false);
    }
  };

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
            Selecione uma organização para editar fichas técnicas.
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
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
              <h1 className="text-3xl font-bold">Editar Ficha Técnica</h1>
              <p className="text-muted-foreground">Carregando dados...</p>
            </div>
          </div>
        </div>

        <Card className="w-full">
          <CardContent className="p-6 space-y-4">
            <div className="animate-pulse h-4 bg-muted rounded w-1/4" />
            <div className="animate-pulse h-10 bg-muted rounded" />
            <div className="animate-pulse h-10 bg-muted rounded" />
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!technicalSheet) {
    return (
      <div className="flex flex-1 flex-col gap-6 p-6">
        <div className="flex items-center gap-4">
          <NavigationButton
            href="/technical-sheets/list"
            variant="outline"
            size="sm"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
          </NavigationButton>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl flex items-center justify-center shadow-lg">
              <ChefHat className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Ficha técnica não encontrada</h1>
              <p className="text-muted-foreground">
                A ficha técnica solicitada não existe.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
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
            <h1 className="text-3xl font-bold">Editar Ficha Técnica</h1>
            <p className="text-muted-foreground">
              Atualize os dados da ficha técnica
            </p>
          </div>
        </div>
      </div>

      <TechnicalSheetGenerator
        organizationId={selectedOrganization.id}
        onSave={handleSave}
        isSaving={saving}
        initialData={technicalSheet}
      />
    </div>
  );
}
