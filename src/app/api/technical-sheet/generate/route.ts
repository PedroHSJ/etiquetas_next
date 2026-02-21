import { NextRequest, NextResponse } from "next/server";
import { createAIProvider } from "@/lib/ai-providers";
import { TechnicalSheetRequest } from "@/types/technical-sheet";
import {
  ParseError,
  RawIngredientData,
  IngredientResponse,
} from "@/types/supabase";
import { TechnicalSheetAIService } from "@/lib/services/server/technicalSheetAIService";
import { ApiErrorResponse } from "@/types/common/api";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function POST(request: NextRequest) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session || !session.user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body: TechnicalSheetRequest = await request.json();

    if (!body.dishName || !body.servings) {
      return NextResponse.json(
        { error: "Nome do prato e número de porções são obrigatórios" },
        { status: 400 },
      );
    }

    if (body.servings <= 0) {
      return NextResponse.json(
        { error: "Número de porções deve ser maior que zero" },
        { status: 400 },
      );
    }

    const aiProvider = process.env.AI_PROVIDER || "openai";
    const openaiKey = process.env.OPENAI_API_KEY;

    if (!openaiKey) {
      return NextResponse.json(
        { error: "Chave da API OpenAI não configurada" },
        { status: 500 },
      );
    }

    const aiProviderInstance = createAIProvider();
    const cacheService = new TechnicalSheetAIService();

    const systemPrompt = `
Você é um chef especialista em fichas técnicas de cozinha profissional.
Sua tarefa é gerar uma ficha técnica completa com ingredientes, modo de preparo e insights nutricionais.

CRÍTICO: Responda APENAS com JSON válido e COMPLETO. NÃO TRUNCAR A RESPOSTA.

Regras OBRIGATÓRIAS:
1. Resposta deve ser JSON puro, sem markdown, sem \`\`\`json, sem texto extra
2. Use APENAS aspas duplas (")
3. NÃO use vírgulas no final de arrays ou objetos
4. Valores numéricos para servings devem ser números, não strings
5. Valores de quantity devem ser strings simples
6. Máximo 6 ingredientes para garantir resposta completa
7. Use unidades simples: kg, g, L, mL, un
8. SEMPRE complete o JSON até o final com todas as chaves fechadas
9. NÃO interrompa a resposta no meio - complete tudo até a última chave }
10. Mantenha textos concisos para evitar truncamento

Exemplo EXATO (COPIE ESTA ESTRUTURA):
{
"dishName": "Arroz com Frango",
"servings": 4,
"ingredients": [
{"name": "Arroz", "quantity": "2", "unit": "un"},
{"name": "Frango", "quantity": "500", "unit": "g"},
{"name": "Cebola", "quantity": "1", "unit": "un"},
{"name": "Alho", "quantity": "3", "unit": "g"},
{"name": "Sal", "quantity": "5", "unit": "g"},
{"name": "Óleo", "quantity": "30", "unit": "mL"}
],
"preparationTime": "30",
"cookingTime": "45",
"difficulty": "médio",
"preparationSteps": [
"Lave e escorra o arroz",
"Tempere o frango com sal",
"Refogue a cebola e alho",
"Adicione o frango e cozinhe",
"Acrescente o arroz e água",
"Cozinhe até ficar macio"
],
"nutritionalInsights": {
"calories": "420 kcal por porção",
"protein": "35g por porção",
"carbs": "45g por porção",
"fat": "8g por porção",
"fiber": "2g por porção",
"highlights": [
"Rico em proteínas",
"Fonte de carboidratos complexos",
"Baixo em gorduras saturadas"
]
}
}
`;

    const userMessage = `Prato: ${body.dishName}
Porções: ${body.servings}

Forneça a ficha técnica no formato JSON especificado.`;

    if (cacheService) {
      try {
        const cached = await cacheService.getCachedResponse({
          dishName: body.dishName,
          servings: body.servings,
        });

        if (cached?.jsonResponse) {
          console.log("Retornando ficha técnica do cache");
          return NextResponse.json(cached.jsonResponse);
        }
      } catch (cacheError) {
        console.error("Erro ao consultar cache de ficha técnica:", cacheError);
      }
    }

    const generateWithAI = async () => {
      try {
        const response = await aiProviderInstance.sendMessage(
          userMessage,
          systemPrompt,
        );

        const hasOpenBrace = response.includes("{");
        const hasCloseBrace = response.includes("}");
        const openBraces = (response.match(/\{/g) || []).length;
        const closeBraces = (response.match(/\}/g) || []).length;
        const hasIngredients = response.includes("ingredients");

        if (
          !hasOpenBrace ||
          !hasCloseBrace ||
          openBraces !== closeBraces ||
          !hasIngredients
        ) {
          throw new Error(
            "Resposta da IA está claramente incompleta ou malformada",
          );
        }

        if (response.length < 200) {
          throw new Error("Resposta da IA muito curta");
        }

        let parsedResponse;
        try {
          parsedResponse = JSON.parse(response);
        } catch (parseError) {
          try {
            let jsonString = response.trim();
            const startIndex = jsonString.indexOf("{");
            if (startIndex > 0) {
              jsonString = jsonString.substring(startIndex);
            }

            const openBraces = (jsonString.match(/\{/g) || []).length;
            const closeBraces = (jsonString.match(/\}/g) || []).length;
            const openBrackets = (jsonString.match(/\[/g) || []).length;
            const closeBrackets = (jsonString.match(/\]/g) || []).length;

            if (
              !jsonString.endsWith("}") ||
              openBraces !== closeBraces ||
              openBrackets !== closeBrackets
            ) {
              const incompleteStringMatch = jsonString.match(/"[^"]*$/);
              if (incompleteStringMatch) {
                jsonString = jsonString.replace(/"[^"]*$/, '""');
              }

              const incompleteValueMatch =
                jsonString.match(/:\s*[^",\{\[\}\]]*$/);
              if (incompleteValueMatch) {
                jsonString = jsonString.replace(
                  /:\s*([^",\{\[\}\]]*)$/,
                  ':"$1"',
                );
              }

              const missingBrackets = openBrackets - closeBrackets;
              for (let i = 0; i < missingBrackets; i++) {
                jsonString += "]";
              }

              const missingBraces = openBraces - closeBraces;
              for (let i = 0; i < missingBraces; i++) {
                jsonString += "}";
              }
            }

            jsonString = jsonString
              .replace(/,(\s*[}\]])/g, "$1")
              .replace(/:\s*([^",\[\{\d\s][^,\]\}]*)/g, ':"$1"')
              .replace(/"\s*,\s*"/g, '","')
              .replace(/}\s*,\s*{/g, "},{")
              .replace(/,+/g, ",")
              .replace(/\s+/g, " ");

            parsedResponse = JSON.parse(jsonString);
          } catch (secondParseError) {
            throw new Error(
              `Erro ao processar resposta da IA: ${
                secondParseError instanceof Error
                  ? secondParseError.message
                  : "Erro desconhecido"
              }`,
            );
          }
        }

        return parsedResponse;
      } catch (providerError: unknown) {
        return {
          dishName: body.dishName,
          servings: body.servings,
          ingredients: [],
          preparationTime: "30",
          cookingTime: "45",
          difficulty: "médio",
        };
      }
    };

    const parsedResponse = await generateWithAI();

    if (
      !parsedResponse.ingredients ||
      !Array.isArray(parsedResponse.ingredients)
    ) {
      throw new Error("Resposta da IA não contém lista de ingredientes válida");
    }

    parsedResponse.ingredients = parsedResponse.ingredients
      .filter((ingredient: RawIngredientData) => ingredient && ingredient.name)
      .map(
        (ingredient: RawIngredientData): IngredientResponse => ({
          name: String(ingredient.name || "").trim(),
          quantity: String(ingredient.quantity || "0").replace(/[^\d.,]/g, ""),
          unit: String(ingredient.unit || "un").toLowerCase(),
        }),
      )
      .filter((ingredient: IngredientResponse) => ingredient.name);

    if (parsedResponse.ingredients.length === 0) {
      parsedResponse.ingredients = [
        { name: "Ingrediente principal", quantity: "500", unit: "g" },
        { name: "Sal", quantity: "5", unit: "g" },
        { name: "Óleo", quantity: "30", unit: "mL" },
      ];
    }

    if (
      !parsedResponse.preparationSteps ||
      parsedResponse.preparationSteps.length === 0
    ) {
      parsedResponse.preparationSteps = [
        "Prepare todos os ingredientes",
        "Tempere conforme indicado",
        "Cozinhe até o ponto desejado",
        "Sirva imediatamente",
      ];
    }

    if (!parsedResponse.nutritionalInsights) {
      parsedResponse.nutritionalInsights = {
        calories: "350",
        protein: "15",
        carbs: "45",
        fat: "12",
        fiber: "3",
        highlights: [
          "Fonte de energia",
          "Contém proteínas",
          "Carboidratos para energia",
        ],
      };
    }

    const result = {
      dishName: parsedResponse.dishName || body.dishName,
      servings: parsedResponse.servings || body.servings,
      ingredients: parsedResponse.ingredients,
      preparationSteps: parsedResponse.preparationSteps,
      nutritionalInsights: parsedResponse.nutritionalInsights,
      preparationTime: parsedResponse.preparationTime,
      cookingTime: parsedResponse.cookingTime,
      difficulty: parsedResponse.difficulty || "médio",
    };

    if (cacheService) {
      try {
        await cacheService.saveResponse({
          dishName: body.dishName,
          servings: body.servings,
          response: result,
        });
      } catch (insertError) {
        console.error("Erro ao salvar cache da ficha técnica:", insertError);
      }
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Erro na API de geração de ficha técnica:", error);

    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Erro interno do servidor",
      },
      { status: 500 },
    );
  }
}
