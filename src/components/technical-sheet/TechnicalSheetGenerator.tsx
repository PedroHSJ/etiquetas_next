"use client";

import React, { useState } from "react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ChefHat, Users, Clock, Loader2, Plus, Save, RotateCcw, Calculator } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TechnicalSheetService } from "@/lib/services/technicalSheetService";
import {
  TechnicalSheetRequest,
  TechnicalSheetResponse,
  EditableIngredient,
} from "@/types/technical-sheet";
import { EditableIngredientList } from "./EditableIngredientList";

interface TechnicalSheetGeneratorProps {
  organizationId: string;
  onSave?: (sheet: TechnicalSheetResponse & { ingredients: EditableIngredient[] }) => void;
}

export const TechnicalSheetGenerator: React.FC<TechnicalSheetGeneratorProps> = ({
  organizationId,
  onSave,
}) => {
  const [dishName, setDishName] = useState("");
  const [servings, setServings] = useState<number>(4);
  const [isGenerating, setIsGenerating] = useState(false);
  const [technicalSheet, setTechnicalSheet] = useState<TechnicalSheetResponse | null>(null);
  const [editableIngredients, setEditableIngredients] = useState<EditableIngredient[]>([]);
  const [originalServings, setOriginalServings] = useState<number>(4);

  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!dishName.trim()) {
      toast.error("Por favor, informe o nome do prato.");
      return;
    }

    if (servings <= 0) {
      toast.error("O número de porções deve ser maior que zero.");
      return;
    }

    setIsGenerating(true);

    try {
      const request: TechnicalSheetRequest = {
        dishName: dishName.trim(),
        servings,
      };

      const response = await TechnicalSheetService.generateIngredientSuggestions(request);

      // Buscar produtos correspondentes
      const matchedIngredients = await TechnicalSheetService.matchIngredientsWithProducts(
        response.ingredients,
        organizationId
      );

      setTechnicalSheet(response);
      setEditableIngredients(matchedIngredients);
      setOriginalServings(response.servings);

      toast.success(
        `Ficha técnica gerada! ${response.ingredients.length} ingredientes sugeridos para ${response.dishName}.`
      );
    } catch (error) {
      console.error("Erro ao gerar ficha técnica:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Erro ao gerar ficha técnica. Tente novamente em alguns instantes."
      );
    } finally {
      setIsGenerating(false);
    }
  };

  const handleServingsChange = (newServings: number) => {
    if (!technicalSheet || newServings <= 0) return;

    const proportionalIngredients = TechnicalSheetService.calculateProportionalQuantities(
      editableIngredients,
      originalServings,
      newServings
    );

    setEditableIngredients(proportionalIngredients);
    setServings(newServings);
  };

  const handleIngredientsChange = (updatedIngredients: EditableIngredient[]) => {
    setEditableIngredients(updatedIngredients);
  };

  const handleAddIngredient = () => {
    const newIngredient: EditableIngredient = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: "",
      quantity: "1",
      unit: "un",
      originalQuantity: "1",
      isEditing: true,
    };

    setEditableIngredients([...editableIngredients, newIngredient]);
  };

  const handleSave = () => {
    if (!technicalSheet) return;

    const finalSheet = {
      ...technicalSheet,
      servings,
      ingredients: editableIngredients,
    };

    onSave?.(finalSheet);
  };

  const handleReset = () => {
    setDishName("");
    setServings(4);
    setTechnicalSheet(null);
    setEditableIngredients([]);
    setOriginalServings(4);
  };

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "fácil":
        return "bg-green-100 text-green-800";
      case "médio":
        return "bg-yellow-100 text-yellow-800";
      case "difícil":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="space-y-6">
      {/* Formulário de entrada */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ChefHat className="h-5 w-5" />
            Nova Ficha Técnica
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="dishName">Nome do Prato</Label>
              <Input
                id="dishName"
                placeholder="Ex: Feijoada completa"
                value={dishName}
                onChange={(e) => setDishName(e.target.value)}
                disabled={isGenerating}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="servings">Número de Porções</Label>
              <Input
                id="servings"
                type="number"
                min="1"
                max="1000"
                value={servings}
                onChange={(e) => setServings(parseInt(e.target.value) || 1)}
                disabled={isGenerating}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !dishName.trim()}
              className="flex-1"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Gerando ficha técnica...
                </>
              ) : (
                <>
                  <ChefHat className="mr-2 h-4 w-4" />
                  Gerar Ficha Técnica
                </>
              )}
            </Button>

            {technicalSheet && (
              <Button variant="outline" onClick={handleReset} disabled={isGenerating}>
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Resultado da ficha técnica */}
      {technicalSheet && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <ChefHat className="h-5 w-5" />
                {technicalSheet.dishName}
              </CardTitle>
              <div className="flex items-center gap-2">
                {technicalSheet.difficulty && (
                  <Badge className={getDifficultyColor(technicalSheet.difficulty)}>
                    {technicalSheet.difficulty}
                  </Badge>
                )}
              </div>
            </div>

            <div className="text-muted-foreground flex items-center gap-6 text-sm">
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <Input
                  type="number"
                  min="1"
                  max="1000"
                  value={servings}
                  onChange={(e) => handleServingsChange(parseInt(e.target.value) || 1)}
                  className="h-6 w-20 text-xs"
                />
                <span>porções</span>
              </div>

              {technicalSheet.preparationTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Preparo: {technicalSheet.preparationTime}</span>
                </div>
              )}

              {technicalSheet.cookingTime && (
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>Cozimento: {technicalSheet.cookingTime}</span>
                </div>
              )}
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold">Ingredientes</h3>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={handleAddIngredient}>
                  <Plus className="mr-1 h-4 w-4" />
                  Adicionar
                </Button>
                {servings !== originalServings && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleServingsChange(originalServings)}
                  >
                    <Calculator className="mr-1 h-4 w-4" />
                    Resetar quantidades
                  </Button>
                )}
              </div>
            </div>

            <EditableIngredientList
              ingredients={editableIngredients}
              organizationId={organizationId}
              onChange={handleIngredientsChange}
            />

            {/* Modo de Preparo */}
            {technicalSheet.preparationSteps && technicalSheet.preparationSteps.length > 0 && (
              <div className="space-y-3">
                <Separator />
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <ChefHat className="h-5 w-5" />
                  Modo de Preparo
                </h3>
                <div className="space-y-2">
                  {technicalSheet.preparationSteps.map((step: string, index: number) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="bg-primary text-primary-foreground flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full text-sm font-medium">
                        {index + 1}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Insights Nutricionais */}
            {technicalSheet.nutritionalInsights && (
              <div className="space-y-3">
                <Separator />
                <h3 className="flex items-center gap-2 text-lg font-semibold">
                  <Calculator className="h-5 w-5" />
                  Informações Nutricionais (por porção)
                </h3>
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center p-3">
                      <div className="text-primary text-2xl font-bold">
                        {technicalSheet.nutritionalInsights.calories}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center p-1 pt-0">
                      <Badge className="text-xs">Calorias</Badge>
                    </CardFooter>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center p-3">
                      <div className="text-primary text-2xl font-bold">
                        {technicalSheet.nutritionalInsights.protein}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center p-1 pt-0">
                      <Badge className="text-xs">Proteínas</Badge>
                    </CardFooter>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center p-3">
                      <div className="text-primary text-2xl font-bold">
                        {technicalSheet.nutritionalInsights.carbs}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center p-1 pt-0">
                      <Badge className="text-xs">Carboidratos</Badge>
                    </CardFooter>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center p-3">
                      <div className="text-primary text-2xl font-bold">
                        {technicalSheet.nutritionalInsights.fat}
                      </div>
                    </CardContent>
                    <CardFooter className="flex flex-col items-center p-1 pt-0">
                      <Badge className="text-xs">Gorduras</Badge>
                    </CardFooter>
                  </Card>
                  <Card className="text-center">
                    <CardContent className="flex flex-col items-center p-3">
                      <div className="text-primary text-2xl font-bold">
                        {technicalSheet.nutritionalInsights.fiber}
                      </div>
                    </CardContent>
                    <CardFooter className="flex h-full flex-col p-1">
                      <Badge className="text-xs">Fibras</Badge>
                    </CardFooter>
                  </Card>
                </div>

                {technicalSheet.nutritionalInsights.highlights &&
                  technicalSheet.nutritionalInsights.highlights.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Destaques Nutricionais:</h4>
                      <div className="flex flex-wrap gap-2">
                        {technicalSheet.nutritionalInsights.highlights.map(
                          (highlight: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {highlight}
                            </Badge>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            )}

            <Separator />

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="mr-2 h-4 w-4" />
                Limpar
              </Button>
              <Button onClick={handleSave}>
                <Save className="mr-2 h-4 w-4" />
                Salvar Ficha Técnica
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
