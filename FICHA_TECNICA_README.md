# Funcionalidade de Ficha Técnica

## Visão Geral

A funcionalidade de Ficha Técnica permite aos usuários gerar automaticamente fichas técnicas detalhadas para pratos culinários, com quantidades precisas de ingredientes calculadas por inteligência artificial.

## Características Principais

### ✅ Requisitos Atendidos

- **IA Assistida**: Utiliza o `ai-provider` configurado (OpenAI ou GitHub Models) para gerar sugestões inteligentes
- **Integração com Banco**: Busca produtos existentes na tabela `produtos` do banco de dados
- **Interface Editável**: Permite edição manual de quantidades, unidades e ingredientes
- **Tipagem Completa**: Nenhum uso de `any`, todas as interfaces são tipadas
- **Padrão shadcn/ui**: Interface consistente com o resto da aplicação
- **Arquitetura Padrão**: Segue a estrutura de services, types e components do projeto

### 🎯 Funcionalidades

1. **Geração Automática**
   - Digite o nome do prato e número de porções
   - IA gera lista completa de ingredientes com quantidades
   - Busca automática de produtos correspondentes no banco

2. **Edição Inteligente**
   - Edite quantidades em tempo real
   - Busque e substitua ingredientes por produtos cadastrados
   - Adicione novos ingredientes manualmente
   - Cálculo proporcional automático para diferentes porções

3. **Interface Intuitiva**
   - Cards informativos sobre a funcionalidade
   - Instruções passo-a-passo
   - Feedback visual para operações
   - Responsivo e acessível

## Estrutura de Arquivos

```
src/
├── lib/
│   ├── types/
│   │   └── technical-sheet.ts          # Interfaces e tipos
│   └── services/
│       └── technicalSheetService.ts    # Lógica de negócio
├── components/
│   └── technical-sheet/
│       ├── TechnicalSheetGenerator.tsx # Componente principal
│       ├── EditableIngredientList.tsx  # Lista editável de ingredientes
│       └── index.ts                    # Barrel export
└── app/
    └── (sidebar)/
        └── ficha-tecnica/
            └── page.tsx                 # Página da funcionalidade
```

## Tipos e Interfaces

### `TechnicalSheetRequest`

```typescript
interface TechnicalSheetRequest {
  dishName: string;
  servings: number;
}
```

### `IngredientSuggestion`

```typescript
interface IngredientSuggestion {
  name: string;
  quantity: string;
  unit: string;
}
```

### `EditableIngredient`

```typescript
interface EditableIngredient extends IngredientSuggestion {
  id: string;
  productId?: string;
  isEditing: boolean;
  originalQuantity: string;
}
```

## Services

### `TechnicalSheetService`

#### Métodos Principais:

- `generateIngredientSuggestions()`: Gera sugestões via IA
- `matchIngredientsWithProducts()`: Busca produtos correspondentes
- `searchAvailableProducts()`: Busca produtos por termo
- `calculateProportionalQuantities()`: Calcula quantidades proporcionais
- `formatQuantity()`: Formata exibição de quantidades

## Componentes

### `TechnicalSheetGenerator`

Componente principal que orquestra toda a funcionalidade:

- Formulário de entrada (prato + porções)
- Integração com IA para geração
- Exibição de resultados
- Controles de edição e salvamento

#### Props:

```typescript
interface TechnicalSheetGeneratorProps {
  organizationId: string;
  onSave?: (sheet: TechnicalSheetResponse & { ingredients: EditableIngredient[] }) => void;
}
```

### `EditableIngredientList`

Componente para edição da lista de ingredientes:

- Edição inline de quantidades e unidades
- Busca de produtos em tempo real
- Adição/remoção de ingredientes
- Associação com produtos cadastrados

#### Props:

```typescript
interface EditableIngredientListProps {
  ingredients: EditableIngredient[];
  organizationId: string;
  onChange: (ingredients: EditableIngredient[]) => void;
}
```

## Integração com IA

### Prompt System

O sistema utiliza um prompt estruturado que instrui a IA a:

- Retornar respostas em JSON válido
- Incluir quantidades realistas
- Usar unidades brasileiras
- Ser específico com ingredientes
- Considerar temperos e condimentos

### Tratamento de Erros

- Parse robusto de JSON com fallbacks
- Validação de estrutura de resposta
- Mensagens de erro amigáveis
- Logs detalhados para debug

## Integração com Banco de Dados

### Tabela `produtos`

```sql
-- Estrutura utilizada
SELECT
  id,
  nome,
  grupos:grupo_id (nome)
FROM produtos
WHERE nome ILIKE '%termo_busca%'
```

### Features de Busca

- Busca case-insensitive por nome
- Associação com grupos/categorias
- Limite de resultados para performance
- Fallback para ingredientes sem correspondência

## Fluxo de Uso

1. **Entrada**: Usuário digita nome do prato e porções
2. **IA**: Sistema gera sugestões via AI provider
3. **Busca**: Ingredientes são buscados na base de produtos
4. **Exibição**: Lista editável é apresentada
5. **Edição**: Usuário pode ajustar conforme necessário
6. **Cálculo**: Quantidades são recalculadas proporcionalmente
7. **Salvamento**: Ficha final pode ser salva

## Configuração

### Variáveis de Ambiente Necessárias

```bash
# AI Provider (OpenAI ou GitHub)
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
# ou
AI_PROVIDER=github
GITHUB_TOKEN=ghp_...

# Supabase (para acesso ao banco)
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### Dependências Utilizadas

- `@supabase/supabase-js`: Cliente do banco
- `lucide-react`: Ícones
- `sonner`: Notificações toast
- `shadcn/ui`: Componentes de interface

## Recursos Avançados

### Cálculo Proporcional

```typescript
// Exemplo: de 4 para 8 porções (ratio = 2)
const ratio = newServings / originalServings;
const newQuantity = originalQuantity * ratio;
```

### Validação de Quantidades

```typescript
const isValid = !isNaN(parseFloat(quantity)) && parseFloat(quantity) > 0;
```

### Formatação Inteligente

```typescript
// Remove casas decimais desnecessárias
const formatted =
  numericValue % 1 === 0 ? numericValue.toString() : numericValue.toFixed(2).replace(/\.?0+$/, "");
```

## Extensibilidade

A arquitetura permite fácil extensão para:

- **Novos AI Providers**: Implementar interface `AIProvider`
- **Mais Fontes de Produtos**: Adicionar outros services
- **Funcionalidades de Salvamento**: Implementar persistência
- **Exportação**: Adicionar formatos PDF, Excel, etc.
- **Templates**: Criar modelos de pratos pré-definidos

## Testes

Para testar a funcionalidade:

1. Acesse `/ficha-tecnica`
2. Digite um prato conhecido (ex: "Feijoada")
3. Defina número de porções
4. Clique em "Gerar Ficha Técnica"
5. Edite conforme necessário
6. Teste o cálculo proporcional

## Troubleshooting

### Problemas Comuns

1. **IA não responde**: Verificar chaves de API e configuração
2. **Produtos não encontrados**: Verificar dados na tabela `produtos`
3. **Erro de parsing**: IA retornou formato inválido (retry automático)
4. **Quantidades incorretas**: Verificar cálculos proporcionais

### Logs

O sistema registra logs detalhados para debug:

- Requests para IA
- Responses e parsing
- Buscas no banco
- Erros de validação
