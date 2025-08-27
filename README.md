# Sistema de Etiquetas Alimentícias

Um sistema completo para criação, personalização e impressão de etiquetas alimentícias com funcionalidades de drag-and-drop para design personalizado.

## � Funcionalidades

### 📝 Tipos de Etiquetas Disponíveis

1. **Produto Aberto** - Para produtos já abertos que precisam de controle de validade
2. **Manipulado** - Para produtos que foram manipulados/preparados
3. **Descongelado** - Para produtos que foram descongelados
4. **Amostra** - Para amostras de produtos
5. **Etiqueta em Branco** - Para preenchimento manual com caneta

### 🎨 Editor de Templates

- **Interface Drag-and-Drop**: Arraste campos da paleta para a etiqueta
- **Personalização Completa**: Ajuste posição, tamanho, fonte, cores e estilos
- **Campos Disponíveis**:
  - Texto livre
  - Data
  - Temperatura (°C)
  - QR Code
  - Código de Barras
- **Visualização em Tempo Real**: Veja as mudanças instantaneamente
- **Grade de Alinhamento**: Sistema de grade para precisão no posicionamento

### 🖨️ Sistema de Impressão

- **Preview de Impressão**: Visualize antes de imprimir
- **Configuração Flexível**:
  - Quantidade de etiquetas
  - Layout de impressão (etiquetas por linha/coluna)
  - Margens personalizáveis
- **Exportação PDF**: Gere PDFs para impressão profissional
- **Impressão Direta**: Imprima diretamente do navegador

### 💾 Gerenciamento de Templates

- **Salvar Templates**: Salve configurações para reutilização
- **Organização por Tipo**: Templates organizados por categoria
- **Duplicar Templates**: Crie variações facilmente
- **Histórico**: Veja quando templates foram criados/modificados

## 🚀 Tecnologias

- **Frontend**: Next.js 15, TypeScript, Tailwind CSS
- **Backend**: Supabase (PostgreSQL, Auth, Real-time)
- **UI Components**: shadcn/ui, Radix UI
- **Impressão**: jsPDF, html2canvas
- **Drag & Drop**: react-dnd
- **Icons**: Lucide React

## 📦 Instalação

1. Clone o repositório:

```bash
git clone <seu-repositorio>
cd etiquetas_next
```

2. Instale as dependências:

```bash
npm install
```

3. Configure as variáveis de ambiente:

```bash
cp .env.local.example .env.local
```

4. Configure seu projeto Supabase:

   - Crie um projeto em [supabase.com](https://supabase.com)
   - Configure as variáveis no `.env.local`:
     - `NEXT_PUBLIC_SUPABASE_URL`
     - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

5. Configure Google OAuth (opcional):

   - Vá para [Google Cloud Console](https://console.cloud.google.com/)
   - Crie um novo projeto ou selecione um existente
   - Ative a API Google+
   - Vá para "Credenciais" > "Criar Credenciais" > "ID do cliente OAuth 2.0"
   - Configure:
     - Tipo: Aplicativo da Web
     - URIs de redirecionamento autorizados: `https://[SEU-PROJETO].supabase.co/auth/v1/callback`
   - No Supabase:
     - Vá para Authentication > Providers > Google
     - Ative o Google provider
     - Cole o Client ID e Client Secret
     - Configure a URL de callback: `https://[SEU-PROJETO].supabase.co/auth/v1/callback`

6. Execute o projeto:

```bash
npm run dev
```

**Modo Desenvolvimento:** Em ambiente de desenvolvimento (`NODE_ENV=development`), o sistema permite acesso sem login para facilitar o desenvolvimento e testes. Uma barra amarela aparecerá no topo indicando o modo desenvolvimento.

## 🗄️ Estrutura do Banco de Dados

### Tabelas Principais

- `users` - Usuários do sistema
- `organizations` - Empresas/instituições
- `departments` - Departamentos das organizações
- `labels` - Etiquetas de produtos
- `label_templates` - Templates de etiquetas
- `print_layouts` - Layouts de impressão

## 🎨 Sistema de Impressão

O sistema possui um designer avançado de etiquetas com:

### Tamanhos de Papel Suportados

- A4 (210 x 297mm)
- Etiqueta pequena (50 x 30mm)
- Etiqueta média (70 x 40mm)
- Etiqueta grande (100 x 60mm)
- Tamanhos personalizados

### Campos Disponíveis

- Nome do produto
- Data de validade
- Data de criação
- Número do lote
- Responsável
- Nome da organização
- Nome do departamento
- QR Code / Código de barras

### Funcionalidades do Designer

- Interface drag-and-drop
- Redimensionamento de campos
- Configuração de fontes e cores
- Preview em tempo real
- Salvamento de templates

## 🔧 Configuração do Supabase

Execute os seguintes comandos SQL no editor do Supabase:

```sql
-- Criar tabelas principais
-- (Scripts SQL serão fornecidos na documentação completa)
```

## 📱 Páginas do Sistema

- `/login` - Página de login (email/password + Google)
- `/register` - Cadastro de usuários (email/password + Google)
- `/auth/callback` - Callback do Google OAuth
- `/auth/auth-code-error` - Página de erro OAuth
- `/dashboard` - Dashboard principal
- `/labels` - Listagem de etiquetas
- `/labels/create` - Criar nova etiqueta
- `/expiration` - Controle de vencimentos
- `/print/designer` - Designer de layout
- `/print/templates` - Templates salvos
- `/organizations` - Gestão de organizações
- `/departments` - Gestão de departamentos

## 🚦 Status do Projeto

- ✅ Estrutura base criada
- ✅ Autenticação implementada
- ✅ Google OAuth integrado
- ✅ Dashboard básico
- ✅ **Modo desenvolvimento** (acesso sem login)
- 🔄 Sistema de etiquetas (em desenvolvimento)
- 🔄 Designer de impressão (em desenvolvimento)
- 🔄 Controle de vencimentos (em desenvolvimento)

## 📝 Próximos Passos

1. Implementar CRUD completo de etiquetas
2. Desenvolver designer de layouts
3. Criar sistema de vencimentos
4. Implementar impressão personalizada
5. Adicionar relatórios e analytics
6. Testes e otimizações

## 🤝 Contribuição

Este é um projeto de demonstração. Para contribuir:

1. Fork o projeto
2. Crie uma branch para sua feature
3. Commit suas mudanças
4. Push para a branch
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT.
