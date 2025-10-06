import { supabase } from "@/lib/supabaseClient";
import { 
  TechnicalSheetRequest, 
  TechnicalSheetResponse, 
  IngredientSuggestion,
  EditableIngredient 
} from "@/types/technical-sheet";
import { SupabaseProdutoSearch } from "@/types/supabase";

interface SimpleProduct {
  id: string;
  name: string;
  category?: string;
}

export class TechnicalSheetService {

  /**
   * Gera sugestões de ingredientes para um prato usando IA via API route
   */
  static async generateIngredientSuggestions(
    request: TechnicalSheetRequest
  ): Promise<TechnicalSheetResponse> {
    try {
      console.log('Enviando requisição para API:', request);
      
      const response = await fetch('/api/technical-sheet/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request)
      });

      console.log('Status da resposta:', response.status);
      console.log('Headers da resposta:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        let errorMessage = `Erro HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log('Dados de erro:', errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.log('Não foi possível ler JSON de erro');
          // Se não conseguir ler o JSON de erro, usar mensagem padrão
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log('Dados recebidos da API:', data);
      
      // Validar a estrutura da resposta
      if (!data.ingredients || !Array.isArray(data.ingredients)) {
        throw new Error('Resposta inválida da API: lista de ingredientes não encontrada');
      }

      return data;

    } catch (error) {
      console.error('Erro ao gerar sugestões de ingredientes:', error);
      
      if (error instanceof Error) {
        throw error; // Re-throw the original error with its message
      }
      
      throw new Error('Falha ao gerar sugestões de ingredientes. Tente novamente.');
    }
  }

  /**
   * Busca produtos que correspondem aos ingredientes sugeridos
   * Usa a tabela 'produtos' do banco consolidado
   */
  static async matchIngredientsWithProducts(
    ingredients: IngredientSuggestion[],
    organizationId: string
  ): Promise<EditableIngredient[]> {
    const editableIngredients: EditableIngredient[] = [];

    for (const ingredient of ingredients) {
      try {
        // Buscar na tabela produtos usando busca simples por nome
        const { data: matchingProducts, error } = await supabase
          .from('produtos')
          .select(`
            id,
            nome,
            grupos:grupo_id (
              id,
              nome
            )
          `)
          .ilike('nome', `%${ingredient.name}%`)
          .limit(5);

        if (error) {
          console.error(`Erro ao buscar produto para ${ingredient.name}:`, error);
        }

        const editableIngredient: EditableIngredient = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          originalQuantity: ingredient.quantity,
          isEditing: false,
          productId: matchingProducts && matchingProducts.length > 0 ? matchingProducts[0].id?.toString() : undefined
        };

        editableIngredients.push(editableIngredient);
      } catch (error) {
        console.error(`Erro ao buscar produto para ${ingredient.name}:`, error);
        
        // Adicionar ingrediente mesmo sem correspondência
        editableIngredients.push({
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          originalQuantity: ingredient.quantity,
          isEditing: false
        });
      }
    }

    return editableIngredients;
  }

  /**
   * Busca produtos disponíveis para substituição de ingredientes
   * Usa a tabela 'produtos' do banco consolidado
   */
  static async searchAvailableProducts(
    organizationId: string,
    query: string
  ): Promise<SimpleProduct[]> {
    try {
      const { data: produtos, error } = await supabase
        .from('produtos')
        .select(`
          id,
          nome,
          grupos:grupo_id (
            nome
          )
        `)
        .ilike('nome', `%${query}%`)
        .limit(20);

      if (error) {
        console.error('Erro ao buscar produtos:', error);
        return [];
      }

      // Converter para o formato SimpleProduct  
      return produtos?.map((produto: { id: unknown; nome: unknown; grupos?: unknown }) => {
        const grupos = produto.grupos as { nome?: string } | null | undefined;
        return {
          id: String(produto.id),
          name: String(produto.nome),
          category: grupos?.nome || 'Sem categoria'
        };
      }) || [];
    } catch (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }
  }

  /**
   * Calcula quantidades proporcionais para diferentes números de porções
   */
  static calculateProportionalQuantities(
    ingredients: EditableIngredient[],
    originalServings: number,
    newServings: number
  ): EditableIngredient[] {
    const ratio = newServings / originalServings;

    return ingredients.map(ingredient => {
      const numericQuantity = parseFloat(ingredient.originalQuantity);
      const newQuantity = isNaN(numericQuantity) 
        ? ingredient.originalQuantity 
        : (numericQuantity * ratio).toFixed(2);

      return {
        ...ingredient,
        quantity: newQuantity
      };
    });
  }

  /**
   * Valida se uma quantidade é válida
   */
  static isValidQuantity(quantity: string): boolean {
    const numericValue = parseFloat(quantity);
    return !isNaN(numericValue) && numericValue > 0;
  }

  /**
   * Formata uma quantidade para exibição
   */
  static formatQuantity(quantity: string, unit: string): string {
    const numericValue = parseFloat(quantity);
    if (isNaN(numericValue)) return `${quantity} ${unit}`;
    
    // Remover casas decimais desnecessárias
    const formattedValue = numericValue % 1 === 0 
      ? numericValue.toString() 
      : numericValue.toFixed(2).replace(/\.?0+$/, '');
    
    return `${formattedValue} ${unit}`;
  }
}