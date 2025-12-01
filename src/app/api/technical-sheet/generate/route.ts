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
import { getSupabaseBearerClient } from "@/lib/supabaseServer";

export async function POST(request: NextRequest) {
  try {
    const body: TechnicalSheetRequest = await request.json();
    const authHeader = request.headers.get("Authorization");
    const token = authHeader?.replace("Bearer ", "");
    if (!token) {
      const errorResponse: ApiErrorResponse = {
        error: "Access token not provided",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }
    if (!body.dishName || !body.servings) {
      return NextResponse.json(
        { error: "Nome do prato e número de porções são obrigatórios" },
        { status: 400 }
      );
    }

    if (body.servings <= 0) {
      return NextResponse.json(
        { error: "Número de porções deve ser maior que zero" },
        { status: 400 }
      );
    }

    // Verificar configuração das variáveis de ambiente
    const aiProvider = process.env.AI_PROVIDER || "openai";
    const openaiKey = process.env.OPENAI_API_KEY;

    console.log("=== DEBUG CONFIGURAÇÃO ===");
    console.log("AI_PROVIDER:", aiProvider);
    console.log("OPENAI_API_KEY existe:", !!openaiKey);
    console.log("OPENAI_API_KEY comprimento:", openaiKey?.length || 0);
    console.log("=========================");

    if (!openaiKey) {
      return NextResponse.json(
        { error: "Chave da API OpenAI não configurada" },
        { status: 500 }
      );
    }

    const aiProviderInstance = createAIProvider();
    const supabase = getSupabaseBearerClient(token);
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      const errorResponse: ApiErrorResponse = {
        error: "User not authenticated",
      };
      return NextResponse.json(errorResponse, { status: 401 });
    }
    const cacheService = new TechnicalSheetAIService(supabase);

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

IMPORTANTE: Complete toda a estrutura até o } final!
    `;

    const userMessage = `Prato: ${body.dishName}
Porções: ${body.servings}

Forneça a ficha técnica no formato JSON especificado.`;

    // Se possível, tentar retornar do cache para evitar chamada à IA
    if (cacheService) {
      try {
        const cached = await cacheService.getCachedResponse({
          dishName: body.dishName,
          servings: body.servings,
        });

        if (cached?.json_response) {
          console.log("Retornando ficha técnica do cache");
          return NextResponse.json(cached.json_response);
        }
      } catch (cacheError) {
        console.error("Erro ao consultar cache de ficha técnica:", cacheError);
      }
    }
    console.log("Gerando nova ficha técnica com IA...");
    // Função auxiliar para gerar resposta com IA
    const generateWithAI = async () => {
      try {
        // Processar mensagem com IA
        const response = await aiProviderInstance.sendMessage(
          userMessage,
          systemPrompt
        );

        console.log("=== DEBUG RESPOSTA IA ===");
        console.log("Resposta bruta da IA (COMPLETA):");
        console.log(response);
        console.log("Tamanho da resposta:", response.length);
        console.log("Primeira linha:", response.split("\n")[0]);
        console.log("Última linha:", response.split("\n").slice(-1)[0]);
        console.log(
          "Caracteres finais (últimos 200):",
          response.substring(Math.max(0, response.length - 200))
        );
        console.log("========================");

        // Verificar se a resposta está truncada ou incompleta
        console.log("=== VERIFICAÇÃO DE INTEGRIDADE ===");
        const hasOpenBrace = response.includes("{");
        const hasCloseBrace = response.includes("}");
        const openBraces = (response.match(/\{/g) || []).length;
        const closeBraces = (response.match(/\}/g) || []).length;
        const hasIngredients = response.includes("ingredients");
        const hasServings = response.includes("servings");

        console.log("- Tem chave de abertura {:", hasOpenBrace);
        console.log("- Tem chave de fechamento }:", hasCloseBrace);
        console.log("- Chaves abertas:", openBraces, "fechadas:", closeBraces);
        console.log("- Tem campo ingredients:", hasIngredients);
        console.log("- Tem campo servings:", hasServings);

        if (
          !hasOpenBrace ||
          !hasCloseBrace ||
          openBraces !== closeBraces ||
          !hasIngredients
        ) {
          console.log("❌ Resposta claramente incompleta, forçando fallback");
          throw new Error(
            "Resposta da IA está claramente incompleta ou malformada"
          );
        }
        console.log("✅ Verificação básica passou");
        console.log("================================");

        if (response.length < 200) {
          console.log("⚠️ Resposta muito curta (< 200 chars), usando fallback");
          throw new Error("Resposta da IA muito curta");
        }

        // Tentar fazer parse da resposta JSON
        let parsedResponse;
        try {
          // Primeiro, tentar parse direto
          parsedResponse = JSON.parse(response);
          console.log("Parse direto bem-sucedido!");
        } catch (parseError) {
          console.log("Erro no parse direto:", parseError);
          console.log("Posição do erro:", (parseError as ParseError).message);

          try {
            // Se falhar o parse, tentar extrair e corrigir JSON da resposta
            let jsonString = response.trim();

            console.log("=== TENTANDO CORRIGIR JSON ===");
            console.log("String original:", jsonString);

            // Se a resposta não começar com {, procurar o primeiro {
            const startIndex = jsonString.indexOf("{");
            if (startIndex > 0) {
              jsonString = jsonString.substring(startIndex);
              console.log(
                "Removido texto antes do {:",
                jsonString.substring(0, 100) + "..."
              );
            }

            // Verificar se o JSON está incompleto
            const openBraces = (jsonString.match(/\{/g) || []).length;
            const closeBraces = (jsonString.match(/\}/g) || []).length;
            const openBrackets = (jsonString.match(/\[/g) || []).length;
            const closeBrackets = (jsonString.match(/\]/g) || []).length;

            console.log("Análise estrutural:");
            console.log(
              "- Chaves abertas:",
              openBraces,
              "fechadas:",
              closeBraces
            );
            console.log(
              "- Colchetes abertos:",
              openBrackets,
              "fechados:",
              closeBrackets
            );

            // Se não terminar com }, tentar completar o JSON
            if (
              !jsonString.endsWith("}") ||
              openBraces !== closeBraces ||
              openBrackets !== closeBrackets
            ) {
              console.log("JSON parece estar truncado, tentando completar...");

              // Verificar se há string incompleta no final
              const incompleteStringMatch = jsonString.match(/"[^"]*$/);
              if (incompleteStringMatch) {
                console.log(
                  "String incompleta detectada:",
                  incompleteStringMatch[0]
                );
                // Completar a string incompleta
                jsonString = jsonString.replace(/"[^"]*$/, '""');
              }

              // Verificar se há valor incompleto após ":"
              const incompleteValueMatch =
                jsonString.match(/:\s*[^",\{\[\}\]]*$/);
              if (incompleteValueMatch) {
                console.log(
                  "Valor incompleto detectado:",
                  incompleteValueMatch[0]
                );
                // Adicionar aspas ao valor incompleto
                jsonString = jsonString.replace(
                  /:\s*([^",\{\[\}\]]*)$/,
                  ':"$1"'
                );
              }

              // Fechar arrays primeiro
              const missingBrackets = openBrackets - closeBrackets;
              for (let i = 0; i < missingBrackets; i++) {
                jsonString += "]";
                console.log("Adicionado ] para fechar array");
              }

              // Depois fechar objetos
              const missingBraces = openBraces - closeBraces;
              for (let i = 0; i < missingBraces; i++) {
                jsonString += "}";
                console.log("Adicionado } para fechar objeto");
              }
            }

            console.log("JSON após correção de truncamento:");
            console.log(jsonString);
            console.log("===============================");

            // Limpeza adicional do JSON
            jsonString = jsonString
              .replace(/,(\s*[}\]])/g, "$1") // Remove vírgulas trailing
              .replace(/:\s*([^",\[\{\d\s][^,\]\}]*)/g, ':"$1"') // Adiciona aspas em valores sem aspas
              .replace(/"\s*,\s*"/g, '","') // Normaliza vírgulas entre strings
              .replace(/}\s*,\s*{/g, "},{") // Normaliza vírgulas entre objetos
              .replace(/,+/g, ",") // Remove vírgulas duplicadas
              .replace(/\s+/g, " "); // Normaliza espaços

            console.log("JSON final após limpeza:");
            console.log(jsonString);

            parsedResponse = JSON.parse(jsonString);
            console.log("✅ Parse após correção bem-sucedido!");
          } catch (secondParseError) {
            console.log("❌ Erro no segundo parse:", secondParseError);
            console.log(
              "Detalhes do erro:",
              (secondParseError as ParseError).message
            );
            throw new Error(
              `Erro ao processar resposta da IA: ${
                secondParseError instanceof Error
                  ? secondParseError.message
                  : "Erro desconhecido"
              }`
            );
          }
        }

        return parsedResponse;
      } catch (providerError: unknown) {
        const errorMessage =
          providerError instanceof Error
            ? providerError.message
            : "Erro desconhecido";
        console.error(`Erro do ${aiProviderInstance.name}:`, providerError);

        console.log("🔄 Usando dados mock como fallback devido ao erro...");

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

    // Validar estrutura da resposta
    if (
      !parsedResponse.ingredients ||
      !Array.isArray(parsedResponse.ingredients)
    ) {
      throw new Error("Resposta da IA não contém lista de ingredientes válida");
    }

    // Garantir que todos os ingredientes têm as propriedades necessárias
    parsedResponse.ingredients = parsedResponse.ingredients
      .filter((ingredient: RawIngredientData) => ingredient && ingredient.name) // Remove ingredientes inválidos
      .map(
        (ingredient: RawIngredientData): IngredientResponse => ({
          name: String(ingredient.name || "").trim(),
          quantity: String(ingredient.quantity || "0").replace(/[^\d.,]/g, ""), // Remove caracteres não numéricos
          unit: String(ingredient.unit || "un").toLowerCase(),
        })
      )
      .filter((ingredient: IngredientResponse) => ingredient.name); // Remove ingredientes vazios

    // Se não houver ingredientes válidos, criar uma lista básica
    if (parsedResponse.ingredients.length === 0) {
      parsedResponse.ingredients = [
        { name: "Ingrediente principal", quantity: "500", unit: "g" },
        { name: "Sal", quantity: "5", unit: "g" },
        { name: "Óleo", quantity: "30", unit: "mL" },
      ];
    }

    // Fallback para modo de preparo
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

    // Fallback para insights nutricionais
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

    // Cachear a resposta para futuras chamadas
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
      { status: 500 }
    );
  }
}
