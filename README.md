# Sistema de Etiquetas Next.js

Sistema de gestão de etiquetas para Unidades de Alimentação e Nutrição (UAN) desenvolvido com Next.js, Supabase e TypeScript.

## Funcionalidades Principais

- 🏢 **Gestão de Organizações**: Criação e configuração de UANs
- 👥 **Sistema de Perfis**: Gestão de usuários com diferentes níveis de acesso
- 🏷️ **Etiquetas Personalizáveis**: Sistema completo de criação e impressão de etiquetas
- 📦 **Gestão de Produtos**: Cadastro e organização de produtos por categorias
- 🔐 **Controle de Permissões**: Sistema RBAC (Role-Based Access Control)
- ⚡ **Tempo Real**: Atualizações automáticas via Supabase Realtime

## Novidades - Sistema de Perfis em Tempo Real

### Funcionalidades Implementadas

#### 1. **ProfileService com Listeners em Tempo Real**

- Monitora mudanças na tabela `usuarios_organizacoes` automaticamente
- Detecta novos convites aceitos e atualiza a lista de perfis
- Listener também monitora a tabela `convites` para aceites

#### 2. **TeamSwitcher Otimizado**

- Atualização automática quando novos perfis são aceitos
- Interface melhorada com indicadores visuais do perfil ativo
- Suporte para múltiplos perfis com troca fácil
- Estados de loading e erro bem definidos

#### 3. **Hook useActiveProfile**

Novo hook simplificado para acessar informações do perfil ativo:

```typescript
import { useActiveProfile } from "@/hooks/usePermissions";

function MeuComponente() {
  const {
    activeProfile,          // Perfil completo ativo
    userProfiles,          // Lista de todos os perfis
    loading,               // Estado de carregamento
    setActiveProfile,      // Função para trocar perfil
    organizacaoId,         // ID da organização ativa
    organizacaoNome,       // Nome da organização ativa
    perfilNome,           // Nome do perfil ativo
    perfilNivelAcesso,    // Nível de acesso do perfil
    hasActiveProfile,     // Boolean - tem perfil ativo?
    hasMultipleProfiles,  // Boolean - tem múltiplos perfis?
  } = useActiveProfile();

  if (!hasActiveProfile) {
    return <div>Nenhum perfil ativo</div>;
  }

  return (
    <div>
      <h1>Bem-vindo à {organizacaoNome}</h1>
      <p>Seu perfil: {perfilNome}</p>
    </div>
  );
}
```

### Como Funciona

#### 1. **Aceitação de Convites**

1. Usuário aceita convite no onboarding
2. Registro é inserido na tabela `usuarios_organizacoes`
3. Listener detecta mudança automaticamente
4. ProfileContext atualiza lista de perfis
5. TeamSwitcher reflete mudanças instantaneamente

#### 2. **Troca de Perfis**

1. Usuário seleciona novo perfil no TeamSwitcher
2. `activeProfile` é atualizado no context
3. Todas as telas que usam `useActiveProfile` reagem automaticamente
4. Permissões são recarregadas para o novo perfil

#### 3. **Persistência**

- Perfil ativo é salvo no `localStorage`
- Restaurado automaticamente no próximo login
- Se perfil salvo não existe mais, seleciona o primeiro disponível

### Exemplo Prático de Uso

#### Dashboard Dinâmico

```typescript
// src/app/(sidebar)/dashboard/page.tsx
export default function DashboardPage() {
  const {
    organizacaoNome,
    perfilNome,
    hasActiveProfile,
    loading
  } = useActiveProfile();

  if (loading) return <Loading />;
  if (!hasActiveProfile) return <NoProfileMessage />;

  return (
    <div>
      <h1>Dashboard - {organizacaoNome}</h1>
      <Badge>{perfilNome}</Badge>
      {/* Resto do conteúdo */}
    </div>
  );
}
```

#### Componente de Header

```typescript
function Header() {
  const { organizacaoNome, perfilNome } = useActiveProfile();

  return (
    <header>
      <h1>{organizacaoNome}</h1>
      <div>Logado como: {perfilNome}</div>
    </header>
  );
}
```

### Benefícios

1. **Experiência do Usuário**: Mudanças em tempo real sem necessidade de refresh
2. **Desenvolvimento**: Hook simples e reutilizável em qualquer componente
3. **Performance**: Listeners otimizados que só recarregam quando necessário
4. **Confiabilidade**: Estados de loading e erro bem definidos
5. **Flexibilidade**: Suporte nativo para múltiplas organizações/perfis

### Arquitetura Técnica

```
├── ProfileService
│   ├── getAvailableProfiles()     # Busca perfis do usuário
│   ├── createProfileListener()    # Cria listener em tempo real
│   └── removeProfileListener()    # Remove listener
│
├── ProfileContext
│   ├── Gerencia estado dos perfis
│   ├── Implementa listeners automaticamente
│   └── Persiste perfil ativo no localStorage
│
├── useActiveProfile Hook
│   ├── Interface simples para perfil ativo
│   ├── Getters para dados comuns
│   └── Estados de loading/erro
│
└── TeamSwitcher
    ├── Interface visual para troca de perfils
    ├── Indicadores de perfil ativo
    └── Suporte para estados vazios
```

## Tecnologias Utilizadas

- **Frontend**: Next.js 14, React 18, TypeScript
- **Backend**: Supabase (PostgreSQL + Realtime)
- **UI**: Tailwind CSS, shadcn/ui
- **State**: React Context API
- **Auth**: Supabase Auth

## Instalação e Configuração

```bash
# Clone o repositório
git clone <repository-url>

# Instale as dependências
npm install

# Configure as variáveis de ambiente
cp .env.example .env.local

# Execute as migrações do banco
# (Veja SETUP_SUPABASE.md para detalhes)

# Inicie o servidor de desenvolvimento
npm run dev
```

## Estrutura do Projeto

```
src/
├── app/                    # Páginas Next.js App Router
├── components/            # Componentes React reutilizáveis
├── contexts/             # React Contexts (Auth, Profile, etc.)
├── hooks/               # Hooks customizados
├── lib/                # Utilitários e configurações
│   ├── services/      # Services para API calls
│   └── types/        # Definições de tipos TypeScript
└── types/             # Tipos globais
```

## Documentação Adicional

- [Setup do Supabase](./SETUP_SUPABASE.md)
- [Estrutura do Banco](./ESTRUTURA_BANCO.md)
- [Sistema de Etiquetas](./SISTEMA_ETIQUETAS.md)

## Contribuição

1. Fork o projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.
