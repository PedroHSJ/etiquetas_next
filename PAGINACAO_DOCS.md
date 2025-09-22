# Sistema de Paginação Avançada - Documentação

## Visão Geral

O sistema de paginação foi expandido para oferecer duas opções: **Paginação Simples** e **Paginação Avançada**, permitindo flexibilidade baseada nas necessidades do projeto.

## Componentes Implementados

### 1. AdvancedPagination (`advanced-pagination.tsx`)

Componente completo com todas as funcionalidades avançadas:

#### **Funcionalidades Principais**
- **Navegação numérica**: Botões para páginas específicas com ellipsis (...)
- **Controles de salto**: Primeira página, última página, anterior, próxima
- **Seletor de itens por página**: Dropdown para escolher quantos itens mostrar
- **Navegação rápida**: Campo de input para pular diretamente para uma página
- **Informações contextuais**: Mostra range atual e total de itens
- **Design responsivo**: Layout se adapta a telas menores

#### **Propriedades**

```typescript
interface AdvancedPaginationProps {
  currentPage: number                    // Página atual (obrigatório)
  totalPages: number                     // Total de páginas (obrigatório)
  totalItems: number                     // Total de itens (obrigatório)
  itemsPerPage: number                   // Itens por página atual (obrigatório)
  onPageChange: (page: number) => void   // Callback para mudança de página (obrigatório)
  onItemsPerPageChange?: (itemsPerPage: number) => void  // Callback para mudança de itens por página
  showItemsPerPage?: boolean             // Mostrar seletor de itens por página (padrão: true)
  showQuickJump?: boolean                // Mostrar campo de navegação rápida (padrão: true)
  showPageInfo?: boolean                 // Mostrar informações de página (padrão: true)
  pageRangeDisplayed?: number            // Quantas páginas mostrar na navegação (padrão: 5)
  className?: string                     // Classes CSS adicionais
}
```

#### **Características Técnicas**
- **Algoritmo de ellipsis inteligente**: Mostra páginas relevantes baseado na posição atual
- **Validação de input**: Impede navegação para páginas inválidas
- **Accessibility**: Labels descritivos e navegação por teclado
- **Performance otimizada**: Re-renderização mínima com cálculos memoizados

### 2. SimplePagination (`simple-pagination.tsx`)

Componente minimalista para casos simples:

#### **Funcionalidades**
- **Navegação básica**: Anterior/Próximo apenas
- **Informação simples**: "Página X de Y"
- **Contador de itens**: Range e total opcional
- **Design compacto**: Ideal para espaços limitados

#### **Propriedades**

```typescript
interface SimplePaginationProps {
  currentPage: number                    // Página atual
  totalPages: number                     // Total de páginas  
  totalItems: number                     // Total de itens
  itemsPerPage: number                   // Itens por página
  onPageChange: (page: number) => void   // Callback para mudança
  className?: string                     // Classes CSS
  showInfo?: boolean                     // Mostrar informações (padrão: true)
}
```

## Integração com GenericTable

### Novas Propriedades da Tabela

```typescript
interface GenericTableProps<T = any> {
  // ... propriedades existentes
  
  // Configurações de paginação
  itemsPerPage?: number                  // Itens por página inicial (padrão: 10)
  showPagination?: boolean               // Ativar paginação (padrão: true)
  showAdvancedPagination?: boolean       // Usar paginação avançada (padrão: true)
  showItemsPerPageSelector?: boolean     // Mostrar seletor de itens (padrão: true)
  showQuickJump?: boolean                // Mostrar navegação rápida (padrão: true)
  onItemsPerPageChange?: (itemsPerPage: number) => void  // Callback para mudança de itens
}
```

### Estado Interno Gerenciado

A tabela agora gerencia internamente:
- **`itemsPerPage`**: Estado dinâmico do número de itens por página
- **`currentPage`**: Auto-reset quando necessário (ex: ao filtrar)
- **Recalculo automático**: Total de páginas baseado nos dados filtrados

## Exemplos de Uso

### 1. Paginação Avançada Completa

```tsx
<GenericTable
  data={dados}
  columns={colunas}
  itemsPerPage={10}
  showPagination
  showAdvancedPagination
  showItemsPerPageSelector
  showQuickJump
  onItemsPerPageChange={(newSize) => {
    console.log(`Mudou para ${newSize} itens por página`)
  }}
/>
```

### 2. Paginação Simples

```tsx
<GenericTable
  data={dados}
  columns={colunas}
  itemsPerPage={20}
  showPagination
  showAdvancedPagination={false}  // Usa paginação simples
/>
```

### 3. Apenas Navegação (Sem Seletores)

```tsx
<GenericTable
  data={dados}
  columns={colunas}
  showPagination
  showAdvancedPagination
  showItemsPerPageSelector={false}
  showQuickJump={false}
/>
```

### 4. Uso Independente dos Componentes

```tsx
import { AdvancedPagination } from '@/components/ui/advanced-pagination'

function MinhaTabela() {
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage, setItemsPerPage] = useState(10)
  
  return (
    <div>
      {/* Sua tabela custom */}
      <MyCustomTable data={paginatedData} />
      
      {/* Paginação independente */}
      <AdvancedPagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalItems}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />
    </div>
  )
}
```

## Funcionalidades Técnicas Avançadas

### 1. Algoritmo de Ellipsis

O componente `AdvancedPagination` implementa um algoritmo inteligente para mostrar páginas:

```
Páginas 1-7: [1] [2] [3] [4] [5] [6] [7]
Páginas 1-15, atual=8: [1] [...] [6] [7] [8] [9] [10] [...] [15] 
Páginas 1-20, atual=2: [1] [2] [3] [4] [5] [...] [20]
Páginas 1-20, atual=19: [1] [...] [16] [17] [18] [19] [20]
```

### 2. Navegação Rápida

- **Input numérico**: Aceita apenas números válidos
- **Validação em tempo real**: Impede valores fora do range
- **Execução por Enter**: Confirma navegação com tecla Enter
- **Clear automático**: Limpa field após uso bem-sucedido

### 3. Seletor de Itens por Página

- **Opções padrão**: 5, 10, 20, 50, 100 itens
- **Reset de página**: Auto volta para página 1 ao mudar
- **Callback opcional**: Permite customização externa
- **Persistência**: Estado mantido durante navegação

### 4. Responsividade

```css
/* Layout em telas grandes */
flex-row justify-between

/* Layout em telas pequenas */  
flex-col gap-4

/* Controles empilhados */
sm:flex-row
```

## Casos de Uso Recomendados

### AdvancedPagination - Quando Usar
- ✅ **Datasets grandes** (>100 itens)
- ✅ **Usuários power users** que precisam navegar rapidamente
- ✅ **Dashboards analíticos** com muitos dados
- ✅ **Tabelas administrativas** com operações em lote
- ✅ **Quando há espaço** na interface

### SimplePagination - Quando Usar  
- ✅ **Datasets pequenos/médios** (<100 itens)
- ✅ **Interfaces móveis** ou com espaço limitado
- ✅ **Navegação sequencial** (usuários raramente pulam páginas)
- ✅ **Componentes embarcados** em outros layouts
- ✅ **Prioridade na simplicidade** 

## Performance e Otimizações

### Cálculos Memoizados
```typescript
// Páginas calculadas apenas quando necessário
const pageNumbers = useMemo(() => getPageNumbers(), [currentPage, totalPages])

// Re-renderização otimizada
const { startItem, endItem } = useMemo(() => ({
  startItem: (currentPage - 1) * itemsPerPage + 1,
  endItem: Math.min(currentPage * itemsPerPage, totalItems)
}), [currentPage, itemsPerPage, totalItems])
```

### Event Handling Eficiente
- **Debounced input**: Evita validações excessivas no campo de navegação rápida
- **Callbacks memoizados**: Previne re-renderizações desnecessárias
- **Validação prévia**: Impede chamadas de API inválidas

## Acessibilidade (a11y)

### Features Implementadas
- **ARIA labels**: Descrições claras para leitores de tela
- **Keyboard navigation**: Tab order lógico
- **Focus management**: Estados visuais claros
- **Screen reader support**: Anúncios de mudança de página
- **Disabled states**: Indicação clara de controles inativos

### Exemplo de Labels
```typescript
aria-label="Primeira página"
aria-label="Página anterior"  
aria-label={`Ir para página ${pageNumber}`}
title="Próxima página"
```

## Estrutura de Arquivos

```
src/components/ui/
├── advanced-pagination.tsx     # Paginação completa
├── simple-pagination.tsx      # Paginação minimalista  
├── generic-table.tsx           # Tabela com paginação integrada
└── ...

src/app/(sidebar)/
└── exemplo-tabela/
    └── page.tsx               # Demo com 18 usuários para testar paginação
```

## Demonstração Prática

A página `/exemplo-tabela` agora inclui:

1. **18 usuários de exemplo** - Para demonstrar paginação real
2. **Card de debug da paginação** - Mostra estado atual
3. **Botões de teste rápido** - Troca entre 5/10/20 itens por página
4. **Todas as funcionalidades ativas** - Demonstração completa

---

## Próximas Melhorias Sugeridas

1. **Paginação server-side**: Integração com APIs paginadas
2. **Infinite scroll**: Alternativa à paginação tradicional  
3. **Virtual scrolling**: Para datasets muito grandes
4. **Persistência**: Salvar configurações no localStorage
5. **Animações**: Transições suaves entre páginas
6. **Lazy loading**: Carregar dados conforme necessário

A implementação está **completa e robusta**, oferecendo flexibilidade total para diferentes casos de uso! 🚀