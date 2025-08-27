# Sistema de Etiquetas Alimentícias

## Visão Geral

Sistema completo para criação, personalização e impressão de etiquetas alimentícias com editor drag-and-drop e gestão de produtos.

## Funcionalidades Implementadas

### 1. Sistema de Etiquetas

- **5 tipos de etiquetas**: Produto Aberto, Manipulado, Descongelo, Amostra e Branco
- **Editor Drag-and-Drop**: Interface intuitiva para arrastar e personalizar campos
- **Templates Personalizáveis**: Salvar e reutilizar layouts de etiquetas
- **Campos Diversos**: Texto, data, temperatura, QR code, código de barras, produto, quantidade e tipo da etiqueta

### 2. Gestão de Produtos

- **Cadastro Completo**: Nome, descrição, categoria, unidade de medida
- **Informações Nutricionais**: Calorias, proteínas, carboidratos, gorduras, fibras, sódio
- **Dados de Segurança**: Alérgenos, validade, temperatura de armazenamento
- **Sistema de Busca**: Pesquisa rápida por nome e categoria
- **Categorização**: Organização por categorias personalizáveis

### 3. Integração Produto-Etiqueta

- **Seletor de Produtos**: Interface para escolher produtos diretamente nas etiquetas
- **Campos Inteligentes**:
  - **Produto**: Seleciona e exibe nome do produto
  - **Quantidade**: Quantidade + unidade de medida
  - **Tipo da Etiqueta**: Badge colorido no topo da etiqueta
- **Dados Automáticos**: Informações do produto preenchem automaticamente os campos

### 4. Editor Visual

- **Drag-and-Drop**: Mover campos livremente na etiqueta
- **Redimensionamento**: Ajustar tamanho de cada campo
- **Personalização**: Cores, fontes, bordas e estilos
- **Preview em Tempo Real**: Ver resultado enquanto edita

### 5. Sistema de Impressão

- **Preview de Impressão**: Visualizar antes de imprimir
- **Múltiplas Etiquetas**: Definir quantidade e layout
- **Formato Profissional**: Otimizado para impressoras térmicas
- **Exportação PDF**: Salvar etiquetas em PDF

## Estrutura Técnica

### Tecnologias Utilizadas

- **Next.js 15**: Framework React moderno
- **TypeScript**: Tipagem estática
- **@dnd-kit**: Biblioteca drag-and-drop performática
- **shadcn/ui**: Componentes de interface
- **Tailwind CSS**: Estilização utilitária
- **QRCode/JSBarcode**: Geração de códigos

### Arquitetura de Componentes

#### Tipos de Dados

```typescript
// src/lib/types/labels.ts
- LabelField: Campos das etiquetas com propriedades estendidas
- LabelTemplate: Templates salvos
- LabelType: Enum dos tipos de etiqueta

// src/lib/types/products.ts
- Product: Informações completas do produto
- ProductCategory: Categorias de produtos
```

#### Componentes Principais

```
src/components/
├── labels/
│   ├── LabelEditor.tsx          # Editor principal drag-and-drop
│   ├── LabelCanvas.tsx          # Área de edição da etiqueta
│   ├── DraggableField.tsx       # Campos arrastáveis
│   ├── FieldToolbar.tsx         # Barra de ferramentas de campos
│   ├── LabelPrintPreview.tsx    # Preview de impressão
│   └── TemplateManager.tsx      # Gerenciador de templates
├── products/
│   ├── ProductManager.tsx       # CRUD de produtos
│   └── ProductSelector.tsx      # Seletor para etiquetas
└── ui/                          # Componentes base shadcn/ui
```

### Novos Tipos de Campos

#### Campo Produto

- Permite selecionar produto do catálogo
- Exibe nome do produto na etiqueta
- Conecta com dados nutricionais e de segurança

#### Campo Quantidade

- Entrada numérica + seletor de unidade
- Formatos: kg, g, L, mL, un, cx, pct
- Exibição: "500 g", "2 L", etc.

#### Campo Tipo da Etiqueta

- Badge colorido automático
- Posicionamento típico no topo
- Estilos pré-definidos por tipo

## Fluxo de Uso

### 1. Gerenciar Produtos

1. Acessar "Produtos" no menu lateral
2. Cadastrar produtos com informações completas
3. Organizar por categorias
4. Definir unidades de medida

### 2. Criar Template de Etiqueta

1. Acessar "Etiquetas" no menu
2. Escolher tipo de etiqueta
3. Arrastar campos da barra lateral
4. Personalizar posição, tamanho e estilo
5. Salvar template com nome descritivo

### 3. Gerar Etiquetas

1. Abrir template salvo
2. Preencher campos editáveis
3. Selecionar produtos nos campos específicos
4. Definir quantidades
5. Visualizar preview
6. Imprimir ou exportar PDF

## Configurações de Impressão

### Formatos Suportados

- **A4**: Para impressoras convencionais
- **Customizado**: Definir dimensões específicas
- **Múltiplas por página**: Layout em grade

### Parâmetros Ajustáveis

- Tamanho da etiqueta (largura x altura)
- Margens da página
- Espaçamento entre etiquetas
- Quantidade de etiquetas por linha/coluna

## Próximos Passos

### Integrações Planejadas

- [ ] **Supabase**: Persistência de dados
- [ ] **Autenticação**: Login/logout de usuários
- [ ] **Multi-tenant**: Organizações separadas
- [ ] **Relatórios**: Analytics de uso

### Melhorias Futuras

- [ ] **Templates Pré-definidos**: Biblioteca de templates
- [ ] **Importação/Exportação**: Backup de dados
- [ ] **Notificações**: Alertas de validade
- [ ] **Mobile**: Aplicativo móvel

## Comandos de Desenvolvimento

```bash
# Instalar dependências
npm install

# Executar em desenvolvimento
npm run dev

# Build para produção
npm run build

# Executar produção
npm start
```

## Estrutura de Pastas Relevantes

```
src/
├── app/
│   ├── (sidebar)/
│   │   ├── etiquetas/          # Páginas de etiquetas
│   │   └── produtos/           # Páginas de produtos
│   └── globals.css
├── components/
│   ├── labels/                 # Componentes de etiquetas
│   ├── products/              # Componentes de produtos
│   ├── layout/                # Layout da aplicação
│   └── ui/                    # Componentes base
├── lib/
│   └── types/                 # Definições TypeScript
└── contexts/                  # Contextos React
```

Este sistema fornece uma solução completa para gestão de etiquetas alimentícias com interface profissional e funcionalidades avançadas de personalização.
