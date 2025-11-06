import { supabase } from "@/lib/supabaseClient";
import {
  TechnicalSheetRequest,
  TechnicalSheetResponse,
  IngredientSuggestion,
  EditableIngredient,
  TechnicalSheet,
} from "@/types/technical-sheet";
import { SupabaseProdutoSearch } from "@/types/supabase";

interface SimpleProduct {
  id: string;
  name: string;
  category?: string;
}

// Interface para dados de salvamento no banco
export interface SaveTechnicalSheetData {
  nome_prato: string;
  numero_porcoes: number;
  tempo_preparo?: string;
  tempo_cozimento?: string;
  dificuldade?: "fácil" | "médio" | "difícil";
  etapas_preparo?: string[];
  informacoes_nutricionais?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    highlights?: string[];
  };
  organizacao_id: string;
  ingredientes: {
    nome_ingrediente: string;
    quantidade: string;
    unidade: string;
    quantidade_original: string;
    product_id?: number;
    ordem: number;
  }[];
}

// Interface para dados vindos do banco
export interface DatabaseTechnicalSheet {
  id: string;
  nome_prato: string;
  numero_porcoes: number;
  tempo_preparo?: string;
  tempo_cozimento?: string;
  dificuldade?: string;
  etapas_preparo?: string[];
  informacoes_nutricionais?: {
    calories?: string;
    protein?: string;
    carbs?: string;
    fat?: string;
    fiber?: string;
    highlights?: string[];
  };
  organizacao_id: string;
  criado_por: string;
  created_at: string;
  updated_at: string;
  fichas_tecnicas_ingredientes: {
    id: string;
    nome_ingrediente: string;
    quantidade: string;
    unidade: string;
    quantidade_original: string;
    product_id?: number;
    ordem: number;
  }[];
}

export class TechnicalSheetService {
  /**
   * Salva uma nova ficha técnica no banco de dados
   */
  static async saveTechnicalSheet(
    data: SaveTechnicalSheetData
  ): Promise<{ success: boolean; data?: TechnicalSheet; error?: string }> {
    try {
      // Verificar se o usuário está autenticado
      const {
        data: { user },
        error: authError,
      } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error("Usuário não autenticado");
      }

      // Iniciar transação: salvar a ficha técnica principal
      const { data: fichaData, error: fichaError } = await supabase
        .from("fichas_tecnicas")
        .insert({
          nome_prato: data.nome_prato,
          numero_porcoes: data.numero_porcoes,
          tempo_preparo: data.tempo_preparo,
          tempo_cozimento: data.tempo_cozimento,
          dificuldade: data.dificuldade,
          etapas_preparo: data.etapas_preparo,
          informacoes_nutricionais: data.informacoes_nutricionais,
          organizacao_id: data.organizacao_id,
          criado_por: user.id,
        })
        .select()
        .single();

      if (fichaError) {
        console.error("Erro ao salvar ficha técnica:", fichaError);
        throw new Error(fichaError.message);
      }

      // Salvar ingredientes
      if (data.ingredientes && data.ingredientes.length > 0) {
        const ingredientesData = data.ingredientes.map((ing) => ({
          ...ing,
          ficha_tecnica_id: fichaData.id,
        }));

        const { error: ingredientesError } = await supabase
          .from("fichas_tecnicas_ingredientes")
          .insert(ingredientesData);

        if (ingredientesError) {
          console.error("Erro ao salvar ingredientes:", ingredientesError);
          // Tentar remover a ficha técnica criada em caso de erro
          await supabase
            .from("fichas_tecnicas")
            .delete()
            .eq("id", fichaData.id);

          throw new Error(ingredientesError.message);
        }
      }

      // Buscar a ficha completa para retornar
      const savedSheet = await this.getTechnicalSheetById(fichaData.id);
      if (!savedSheet.success || !savedSheet.data) {
        throw new Error("Erro ao recuperar ficha técnica salva");
      }

      return {
        success: true,
        data: savedSheet.data,
      };
    } catch (error) {
      console.error("Erro ao salvar ficha técnica:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Busca uma ficha técnica por ID
   */
  static async getTechnicalSheetById(
    id: string
  ): Promise<{ success: boolean; data?: TechnicalSheet; error?: string }> {
    try {
      const { data, error } = await supabase
        .from("fichas_tecnicas")
        .select(
          `
          *,
          fichas_tecnicas_ingredientes (
            id,
            nome_ingrediente,
            quantidade,
            unidade,
            quantidade_original,
            product_id,
            ordem
          )
        `
        )
        .eq("id", id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      const technicalSheet = this.mapDatabaseToTechnicalSheet(
        data as DatabaseTechnicalSheet
      );

      return {
        success: true,
        data: technicalSheet,
      };
    } catch (error) {
      console.error("Erro ao buscar ficha técnica:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Lista todas as fichas técnicas de uma organização
   */
  static async getTechnicalSheetsByOrganization(
    organizationId: string,
    page: number = 1,
    limit: number = 10
  ): Promise<{
    success: boolean;
    data?: TechnicalSheet[];
    total?: number;
    error?: string;
  }> {
    try {
      const offset = (page - 1) * limit;

      // Buscar total de registros
      const { count, error: countError } = await supabase
        .from("fichas_tecnicas")
        .select("*", { count: "exact", head: true })
        .eq("organizacao_id", organizationId);

      if (countError) {
        throw new Error(countError.message);
      }

      // Buscar fichas técnicas com paginação
      const { data, error } = await supabase
        .from("fichas_tecnicas")
        .select(
          `
          *,
          fichas_tecnicas_ingredientes (
            id,
            nome_ingrediente,
            quantidade,
            unidade,
            quantidade_original,
            product_id,
            ordem
          )
        `
        )
        .eq("organizacao_id", organizationId)
        .order("created_at", { ascending: false })
        .range(offset, offset + limit - 1);

      if (error) {
        throw new Error(error.message);
      }

      const technicalSheets = data.map((item) =>
        this.mapDatabaseToTechnicalSheet(item as DatabaseTechnicalSheet)
      );

      return {
        success: true,
        data: technicalSheets,
        total: count || 0,
      };
    } catch (error) {
      console.error("Erro ao buscar fichas técnicas:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Atualiza uma ficha técnica existente
   */
  static async updateTechnicalSheet(
    id: string,
    data: Partial<SaveTechnicalSheetData>
  ): Promise<{ success: boolean; data?: TechnicalSheet; error?: string }> {
    try {
      // Atualizar dados principais da ficha técnica
      const updateData: Partial<{
        nome_prato: string;
        numero_porcoes: number;
        tempo_preparo?: string;
        tempo_cozimento?: string;
        dificuldade?: "fácil" | "médio" | "difícil";
        etapas_preparo?: string[];
        informacoes_nutricionais?: {
          calories?: string;
          protein?: string;
          carbs?: string;
          fat?: string;
          fiber?: string;
          highlights?: string[];
        };
      }> = {};
      if (data.nome_prato) updateData.nome_prato = data.nome_prato;
      if (data.numero_porcoes) updateData.numero_porcoes = data.numero_porcoes;
      if (data.tempo_preparo !== undefined)
        updateData.tempo_preparo = data.tempo_preparo;
      if (data.tempo_cozimento !== undefined)
        updateData.tempo_cozimento = data.tempo_cozimento;
      if (data.dificuldade !== undefined)
        updateData.dificuldade = data.dificuldade;
      if (data.etapas_preparo !== undefined)
        updateData.etapas_preparo = data.etapas_preparo;
      if (data.informacoes_nutricionais !== undefined)
        updateData.informacoes_nutricionais = data.informacoes_nutricionais;

      const { error: fichaError } = await supabase
        .from("fichas_tecnicas")
        .update(updateData)
        .eq("id", id);

      if (fichaError) {
        throw new Error(fichaError.message);
      }

      // Se há ingredientes para atualizar, remover os antigos e inserir os novos
      if (data.ingredientes) {
        // Remover ingredientes existentes
        const { error: deleteError } = await supabase
          .from("fichas_tecnicas_ingredientes")
          .delete()
          .eq("ficha_tecnica_id", id);

        if (deleteError) {
          throw new Error(deleteError.message);
        }

        // Inserir novos ingredientes
        if (data.ingredientes.length > 0) {
          const ingredientesData = data.ingredientes.map((ing) => ({
            ...ing,
            ficha_tecnica_id: id,
          }));

          const { error: insertError } = await supabase
            .from("fichas_tecnicas_ingredientes")
            .insert(ingredientesData);

          if (insertError) {
            throw new Error(insertError.message);
          }
        }
      }

      // Buscar a ficha atualizada
      const updatedSheet = await this.getTechnicalSheetById(id);
      if (!updatedSheet.success || !updatedSheet.data) {
        throw new Error("Erro ao recuperar ficha técnica atualizada");
      }

      return {
        success: true,
        data: updatedSheet.data,
      };
    } catch (error) {
      console.error("Erro ao atualizar ficha técnica:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Remove uma ficha técnica
   */
  static async deleteTechnicalSheet(
    id: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const { error } = await supabase
        .from("fichas_tecnicas")
        .delete()
        .eq("id", id);

      if (error) {
        throw new Error(error.message);
      }

      return { success: true };
    } catch (error) {
      console.error("Erro ao deletar ficha técnica:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  /**
   * Converte dados do banco para o tipo TechnicalSheet
   */
  private static mapDatabaseToTechnicalSheet(
    data: DatabaseTechnicalSheet
  ): TechnicalSheet {
    return {
      id: data.id,
      dishName: data.nome_prato,
      servings: data.numero_porcoes,
      preparationTime: data.tempo_preparo,
      cookingTime: data.tempo_cozimento,
      difficulty: data.dificuldade as "fácil" | "médio" | "difícil",
      preparationSteps: data.etapas_preparo || [],
      nutritionalInsights: {
        calories: data.informacoes_nutricionais?.calories || "0",
        protein: data.informacoes_nutricionais?.protein || "0",
        carbs: data.informacoes_nutricionais?.carbs || "0",
        fat: data.informacoes_nutricionais?.fat || "0",
        fiber: data.informacoes_nutricionais?.fiber || "0",
        highlights: data.informacoes_nutricionais?.highlights || [],
      },
      organizationId: data.organizacao_id,
      createdBy: data.criado_por,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      ingredients: data.fichas_tecnicas_ingredientes
        .sort((a, b) => a.ordem - b.ordem)
        .map((ing, index) => ({
          id: ing.id,
          name: ing.nome_ingrediente,
          quantity: ing.quantidade,
          unit: ing.unidade,
          originalQuantity: ing.quantidade_original,
          productId: ing.product_id?.toString(),
          isEditing: false,
        })),
    };
  }

  /**
   * Gera sugestões de ingredientes para um prato usando IA via API route
   */
  static async generateIngredientSuggestions(
    request: TechnicalSheetRequest
  ): Promise<TechnicalSheetResponse> {
    try {
      console.log("Enviando requisição para API:", request);

      const response = await fetch("/api/technical-sheet/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
      });

      console.log("Status da resposta:", response.status);
      console.log(
        "Headers da resposta:",
        Object.fromEntries(response.headers.entries())
      );

      if (!response.ok) {
        let errorMessage = `Erro HTTP: ${response.status}`;
        try {
          const errorData = await response.json();
          console.log("Dados de erro:", errorData);
          errorMessage = errorData.error || errorMessage;
        } catch {
          console.log("Não foi possível ler JSON de erro");
          // Se não conseguir ler o JSON de erro, usar mensagem padrão
        }
        throw new Error(errorMessage);
      }

      const data = await response.json();
      console.log("Dados recebidos da API:", data);

      // Validar a estrutura da resposta
      if (!data.ingredients || !Array.isArray(data.ingredients)) {
        throw new Error(
          "Resposta inválida da API: lista de ingredientes não encontrada"
        );
      }

      return data;
    } catch (error) {
      console.error("Erro ao gerar sugestões de ingredientes:", error);

      if (error instanceof Error) {
        throw error; // Re-throw the original error with its message
      }

      throw new Error(
        "Falha ao gerar sugestões de ingredientes. Tente novamente."
      );
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
          .from("products")
          .select(
            `
            id,
            name,
            groups:group_id (
              id,
              name
            )
          `
          )
          .ilike("name", `%${ingredient.name}%`)
          .limit(5);

        if (error) {
          console.error(
            `Erro ao buscar produto para ${ingredient.name}:`,
            error
          );
        }

        interface ProductWithGroup {
          id: number;
          name: string;
          groups?: {
            id: number;
            name: string;
          } | null;
        }

        const typedProducts = matchingProducts as ProductWithGroup[] | null;

        const editableIngredient: EditableIngredient = {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient.name,
          quantity: ingredient.quantity,
          unit: ingredient.unit,
          originalQuantity: ingredient.quantity,
          isEditing: false,
          productId:
            typedProducts && typedProducts.length > 0
              ? typedProducts[0].id?.toString()
              : undefined,
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
          isEditing: false,
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
        .from("products")
        .select(
          `
          id,
          name,
          groups:group_id (
            name
          )
        `
        )
        .ilike("name", `%${query}%`)
        .limit(20);

      if (error) {
        console.error("Erro ao buscar produtos:", error);
        return [];
      }

      interface ProductResult {
        id: number;
        name: string;
        groups?: {
          name?: string;
        } | null;
      }

      const typedProducts = produtos as ProductResult[] | null;

      // Converter para o formato SimpleProduct
      return (
        typedProducts?.map((produto) => ({
          id: produto.id.toString(),
          name: produto.name,
          category: produto.groups?.name || "Sem categoria",
        })) || []
      );
    } catch (error) {
      console.error("Erro ao buscar produtos:", error);
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

    return ingredients.map((ingredient) => {
      const numericQuantity = parseFloat(ingredient.originalQuantity);
      const newQuantity = isNaN(numericQuantity)
        ? ingredient.originalQuantity
        : (numericQuantity * ratio).toFixed(2);

      return {
        ...ingredient,
        quantity: newQuantity,
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
    const formattedValue =
      numericValue % 1 === 0
        ? numericValue.toString()
        : numericValue.toFixed(2).replace(/\.?0+$/, "");

    return `${formattedValue} ${unit}`;
  }
}
