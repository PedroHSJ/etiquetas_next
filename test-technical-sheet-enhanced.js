/**
 * Teste para validar a funcionalidade aprimorada de Ficha Técnica
 * Este arquivo testa a nova estrutura com modo de preparo e insights nutricionais
 */

// Simular resposta da API com nova estrutura
const mockTechnicalSheetResponse = {
  dishName: "Feijoada Completa",
  servings: 6,
  ingredients: [
    { name: "Feijão preto", quantity: "500", unit: "g" },
    { name: "Linguiça calabresa", quantity: "200", unit: "g" },
    { name: "Costela de porco", quantity: "300", unit: "g" },
    { name: "Bacon", quantity: "150", unit: "g" },
    { name: "Cebola", quantity: "2", unit: "un" },
    { name: "Alho", quantity: "4", unit: "g" }
  ],
  preparationTime: "60",
  cookingTime: "180",
  difficulty: "difícil",
  preparationSteps: [
    "Deixe o feijão de molho na véspera",
    "Escorra e cozinhe o feijão em água nova",
    "Em uma panela, refogue bacon e linguiça",
    "Adicione a costela e doure bem",
    "Refogue cebola e alho até dourar",
    "Adicione o feijão cozido e temperos",
    "Cozinhe em fogo baixo por 2 horas",
    "Ajuste sal e pimenta antes de servir"
  ],
  nutritionalInsights: {
    calories: "650",
    protein: "45",
    carbs: "55",
    fat: "25",
    fiber: "12",
    highlights: [
      "Rica em proteínas de alta qualidade",
      "Excelente fonte de ferro",
      "Rica em fibras digestivas",
      "Fonte de vitaminas do complexo B",
      "Alto valor energético"
    ]
  }
};

// Função para validar a estrutura de dados
function validateTechnicalSheetStructure(data) {
  console.log("🧪 Validando estrutura da Ficha Técnica Aprimorada...\n");
  
  // Validar campos obrigatórios
  const requiredFields = ['dishName', 'servings', 'ingredients'];
  const missingFields = requiredFields.filter(field => !data[field]);
  
  if (missingFields.length > 0) {
    console.error("❌ Campos obrigatórios ausentes:", missingFields);
    return false;
  }
  
  console.log("✅ Campos obrigatórios presentes");
  
  // Validar ingredientes
  if (!Array.isArray(data.ingredients) || data.ingredients.length === 0) {
    console.error("❌ Lista de ingredientes inválida");
    return false;
  }
  
  console.log(`✅ ${data.ingredients.length} ingredientes encontrados`);
  
  // Validar modo de preparo
  if (data.preparationSteps) {
    if (!Array.isArray(data.preparationSteps)) {
      console.error("❌ Modo de preparo deve ser um array");
      return false;
    }
    console.log(`✅ ${data.preparationSteps.length} passos de preparo encontrados`);
  }
  
  // Validar insights nutricionais
  if (data.nutritionalInsights) {
    const nutritionalFields = ['calories', 'protein', 'carbs', 'fat', 'fiber', 'highlights'];
    const nutrition = data.nutritionalInsights;
    
    for (const field of nutritionalFields) {
      if (!nutrition[field]) {
        console.error(`❌ Campo nutricional ausente: ${field}`);
        return false;
      }
    }
    
    if (!Array.isArray(nutrition.highlights)) {
      console.error("❌ Highlights deve ser um array");
      return false;
    }
    
    console.log(`✅ Informações nutricionais completas com ${nutrition.highlights.length} destaques`);
  }
  
  return true;
}

// Função para simular cálculo proporcional
function calculateProportionalQuantities(originalData, newServings) {
  console.log(`🧮 Calculando quantidades proporcionais para ${newServings} porções...\n`);
  
  const factor = newServings / originalData.servings;
  
  const adjustedIngredients = originalData.ingredients.map(ingredient => {
    const originalQty = parseFloat(ingredient.quantity);
    const newQty = (originalQty * factor).toFixed(1);
    
    return {
      ...ingredient,
      quantity: newQty
    };
  });
  
  // Ajustar informações nutricionais proporcionalmente
  let adjustedNutrition = null;
  if (originalData.nutritionalInsights) {
    adjustedNutrition = {
      ...originalData.nutritionalInsights,
      calories: (parseFloat(originalData.nutritionalInsights.calories) * factor).toFixed(0),
      protein: (parseFloat(originalData.nutritionalInsights.protein) * factor).toFixed(1),
      carbs: (parseFloat(originalData.nutritionalInsights.carbs) * factor).toFixed(1),
      fat: (parseFloat(originalData.nutritionalInsights.fat) * factor).toFixed(1),
      fiber: (parseFloat(originalData.nutritionalInsights.fiber) * factor).toFixed(1)
    };
  }
  
  return {
    ...originalData,
    servings: newServings,
    ingredients: adjustedIngredients,
    nutritionalInsights: adjustedNutrition
  };
}

// Função para exibir resumo nutricional
function displayNutritionalSummary(data) {
  console.log("📊 RESUMO NUTRICIONAL (por porção):");
  console.log("=" * 40);
  
  if (data.nutritionalInsights) {
    const nutrition = data.nutritionalInsights;
    console.log(`🔥 Calorias: ${nutrition.calories}`);
    console.log(`🥩 Proteínas: ${nutrition.protein}g`);
    console.log(`🌾 Carboidratos: ${nutrition.carbs}g`);
    console.log(`🥑 Gorduras: ${nutrition.fat}g`);
    console.log(`🌿 Fibras: ${nutrition.fiber}g`);
    
    console.log("\n💡 DESTAQUES NUTRICIONAIS:");
    nutrition.highlights.forEach((highlight, index) => {
      console.log(`   ${index + 1}. ${highlight}`);
    });
  }
  
  console.log("\n");
}

// Executar testes
console.log("🍽️  TESTE DE FICHA TÉCNICA APRIMORADA");
console.log("=" * 50);
console.log("\n");

// Teste 1: Validar estrutura original
console.log("📝 TESTE 1: Validação da estrutura de dados");
console.log("-" * 30);
const isValid = validateTechnicalSheetStructure(mockTechnicalSheetResponse);
console.log(`Resultado: ${isValid ? "✅ PASSOU" : "❌ FALHOU"}\n`);

// Teste 2: Exibir resumo nutricional
console.log("📊 TESTE 2: Exibição de informações nutricionais");
console.log("-" * 30);
displayNutritionalSummary(mockTechnicalSheetResponse);

// Teste 3: Cálculo proporcional para diferentes porções
console.log("🧮 TESTE 3: Cálculos proporcionais");
console.log("-" * 30);
const doubledServings = calculateProportionalQuantities(mockTechnicalSheetResponse, 12);
console.log("✅ Quantidades ajustadas para 12 porções:");
doubledServings.ingredients.forEach(ing => {
  console.log(`   ${ing.name}: ${ing.quantity} ${ing.unit}`);
});

console.log("\n📊 Informações nutricionais ajustadas:");
if (doubledServings.nutritionalInsights) {
  const nutrition = doubledServings.nutritionalInsights;
  console.log(`   Calorias: ${nutrition.calories} | Proteínas: ${nutrition.protein}g`);
}

console.log("\n");

// Teste 4: Validar modo de preparo
console.log("👨‍🍳 TESTE 4: Modo de preparo");
console.log("-" * 30);
if (mockTechnicalSheetResponse.preparationSteps) {
  console.log(`✅ ${mockTechnicalSheetResponse.preparationSteps.length} passos encontrados:`);
  mockTechnicalSheetResponse.preparationSteps.forEach((step, index) => {
    console.log(`   ${index + 1}. ${step}`);
  });
}

console.log("\n");
console.log("🎉 TODOS OS TESTES CONCLUÍDOS!");
console.log("=" * 50);