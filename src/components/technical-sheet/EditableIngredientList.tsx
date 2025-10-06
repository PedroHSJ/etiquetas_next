"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Edit2, 
  Check, 
  X, 
  Trash2, 
  Search,
  Package
} from "lucide-react";
import { EditableIngredient } from "@/lib/types/technical-sheet";
import { UNIT_OF_MEASURE_OPTIONS } from "@/lib/types/products";
import { TechnicalSheetService } from "@/lib/services/technicalSheetService";
import { cn } from "@/lib/utils";

interface SimpleProduct {
  id: string;
  name: string;
  category?: string;
}

interface EditableIngredientListProps {
  ingredients: EditableIngredient[];
  organizationId: string;
  onChange: (ingredients: EditableIngredient[]) => void;
}

export const EditableIngredientList: React.FC<EditableIngredientListProps> = ({
  ingredients,
  organizationId,
  onChange
}) => {
  const [searchingProducts, setSearchingProducts] = useState<Record<string, SimpleProduct[]>>({});

  const updateIngredient = (id: string, updates: Partial<EditableIngredient>) => {
    const updatedIngredients = ingredients.map(ingredient =>
      ingredient.id === id ? { ...ingredient, ...updates } : ingredient
    );
    onChange(updatedIngredients);
  };

  const removeIngredient = (id: string) => {
    const updatedIngredients = ingredients.filter(ingredient => ingredient.id !== id);
    onChange(updatedIngredients);
  };

  const startEdit = (id: string) => {
    updateIngredient(id, { isEditing: true });
  };

  const cancelEdit = (id: string) => {
    const ingredient = ingredients.find(i => i.id === id);
    if (ingredient) {
      updateIngredient(id, { 
        isEditing: false,
        quantity: ingredient.originalQuantity
      });
    }
  };

  const saveEdit = (id: string) => {
    const ingredient = ingredients.find(i => i.id === id);
    if (ingredient) {
      if (!TechnicalSheetService.isValidQuantity(ingredient.quantity)) {
        return; // Não salva se quantidade for inválida
      }
      
      updateIngredient(id, { 
        isEditing: false,
        originalQuantity: ingredient.quantity
      });
    }
  };

  const searchProducts = async (ingredientId: string, query: string) => {
    if (!query.trim()) {
      setSearchingProducts(prev => ({ ...prev, [ingredientId]: [] }));
      return;
    }

    try {
      const products = await TechnicalSheetService.searchAvailableProducts(organizationId, query);
      setSearchingProducts(prev => ({ ...prev, [ingredientId]: products }));
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
    }
  };

  const selectProduct = (ingredientId: string, product: SimpleProduct) => {
    updateIngredient(ingredientId, { 
      name: product.name,
      productId: product.id
    });
    setSearchingProducts(prev => ({ ...prev, [ingredientId]: [] }));
  };

  const getQuantityValidationClass = (quantity: string) => {
    return TechnicalSheetService.isValidQuantity(quantity) 
      ? "border-input" 
      : "border-destructive";
  };

  if (ingredients.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Package className="w-12 h-12 mx-auto mb-2 opacity-50" />
        <p>Nenhum ingrediente adicionado ainda.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {ingredients.map((ingredient) => (
        <div
          key={ingredient.id}
          className="flex items-center gap-3 p-3 border rounded-lg bg-background"
        >
          {/* Nome do ingrediente */}
          <div className="flex-1 min-w-0">
            {ingredient.isEditing ? (
              <div className="space-y-2">
                <Input
                  value={ingredient.name}
                  onChange={(e) => {
                    updateIngredient(ingredient.id, { name: e.target.value });
                    searchProducts(ingredient.id, e.target.value);
                  }}
                  placeholder="Nome do ingrediente"
                  className="text-sm"
                />
                
                {/* Lista de produtos sugeridos */}
                {searchingProducts[ingredient.id]?.length > 0 && (
                  <div className="border rounded-md bg-background max-h-32 overflow-y-auto">
                    {searchingProducts[ingredient.id].map((product) => (
                      <button
                        key={product.id}
                        onClick={() => selectProduct(ingredient.id, product)}
                        className="w-full text-left px-3 py-2 text-sm hover:bg-muted flex items-center gap-2"
                      >
                        <Package className="w-3 h-3" />
                        <span className="truncate">{product.name}</span>
                        {product.category && (
                          <span className="text-xs text-muted-foreground">({product.category})</span>
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{ingredient.name}</span>
                {ingredient.productId && (
                  <Badge variant="secondary" className="text-xs">
                    <Package className="w-3 h-3 mr-1" />
                    Produto
                  </Badge>
                )}
              </div>
            )}
          </div>

          {/* Quantidade */}
          <div className="flex items-center gap-1 min-w-[120px]">
            {ingredient.isEditing ? (
              <Input
                type="number"
                min="0"
                step="0.01"
                value={ingredient.quantity}
                onChange={(e) => updateIngredient(ingredient.id, { quantity: e.target.value })}
                className={cn("w-20 text-sm", getQuantityValidationClass(ingredient.quantity))}
              />
            ) : (
              <span className="text-sm font-mono">
                {TechnicalSheetService.formatQuantity(ingredient.quantity, ingredient.unit)}
              </span>
            )}
          </div>

          {/* Unidade */}
          <div className="min-w-[80px]">
            {ingredient.isEditing ? (
              <Select
                value={ingredient.unit}
                onValueChange={(value) => updateIngredient(ingredient.id, { unit: value })}
              >
                <SelectTrigger className="text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {UNIT_OF_MEASURE_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.value}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <span className="text-sm text-muted-foreground">{ingredient.unit}</span>
            )}
          </div>

          {/* Ações */}
          <div className="flex items-center gap-1">
            {ingredient.isEditing ? (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => saveEdit(ingredient.id)}
                  disabled={!TechnicalSheetService.isValidQuantity(ingredient.quantity)}
                  className="h-8 w-8 p-0"
                >
                  <Check className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => cancelEdit(ingredient.id)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => startEdit(ingredient.id)}
                  className="h-8 w-8 p-0"
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => removeIngredient(ingredient.id)}
                  className="h-8 w-8 p-0 text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};