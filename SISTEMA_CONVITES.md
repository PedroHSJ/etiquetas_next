# Sistema de Convites

Sistema completo de gestão de convites para organizações, permitindo convidar usuários para diferentes perfis e gerenciar o ciclo de vida dos convites.

## Funcionalidades

### 🎯 **Gestão Completa de Convites**
- **Criação**: Envio de convites por email com perfil específico
- **Acompanhamento**: Visualização em tempo real do status dos convites
- **Ações Diretas**: Aceitar, rejeitar ou cancelar convites diretamente na interface
- **Expiração**: Controle automático de validade dos convites

### 📊 **Interface com Abas**
- **Pendentes**: Convites aguardando resposta
- **Aceitos**: Convites que foram aceitos pelos usuários
- **Rejeitados**: Convites que foram rejeitados
- **Todos**: Visão geral de todos os convites

### 🎨 **Status com Badges Coloridos**
- **Pendente**: Amarelo (aguardando resposta)
- **Aceito**: Verde (usuário adicionado à organização)
- **Rejeitado**: Vermelho (usuário recusou o convite)
- **Expirado**: Cinza (convite vencido)

## Estrutura de Arquivos

```
src/
├── app/(sidebar)/convites/
│   ├── page.tsx              # Lista principal com abas
│   ├── create/
│   │   └── page.tsx         # Formulário de criação
│   └── layout.tsx           # Layout da seção
├── lib/services/
│   └── conviteService.ts    # Serviço de gestão de convites
└── types/
    └── onboarding.ts        # Tipos dos convites
```

## Como Funciona

### 1. **Criação de Convite**
```typescript
// Usar o ConviteService para criar um novo convite
const novoConvite = await ConviteService.criarConvite({
  email: "usuario@exemplo.com",
  organizacao_id: "org-id",
  perfil_id: "perfil-id",
  convidado_por: "user-id",
  expira_em: "2024-12-31T23:59:59Z"
});
```

### 2. **Aceitação de Convite**
```typescript
// Usuário aceita o convite
await ConviteService.aceitarConvite(conviteId, userId);

// Sistema automaticamente:
// 1. Atualiza status para 'aceito'
// 2. Adiciona usuário à organização
// 3. Cria registro em usuarios_organizacoes
```

### 3. **Rejeição de Convite**
```typescript
// Usuário rejeita o convite
await ConviteService.rejeitarConvite(conviteId, userId);

// Sistema atualiza status para 'rejeitado'
```

## Componentes Principais

### **ConvitesPage** (`/convites`)
- **Tabs**: Navegação entre diferentes status
- **Tabela Responsiva**: Visualização em desktop e cards em mobile
- **Ações Diretas**: Botões para aceitar/rejeitar convites pendentes
- **Contadores**: Número de convites em cada status

### **CreateConvitePage** (`/convites/create`)
- **Formulário**: Email, perfil, data de expiração
- **Validação**: Campos obrigatórios e validações
- **Seletor de Perfis**: Lista de perfis disponíveis
- **Calendário**: Seleção de data de expiração

## Serviços

### **ConviteService**
```typescript
class ConviteService {
  // Buscar convites por organização
  static async getConvitesByOrganization(organizationId: string): Promise<Convite[]>
  
  // Buscar convites por status
  static async getConvitesByStatus(organizationId: string, status: Convite['status']): Promise<Convite[]>
  
  // Aceitar convite
  static async aceitarConvite(conviteId: string, userId: string): Promise<boolean>
  
  // Rejeitar convite
  static async rejeitarConvite(conviteId: string, userId: string): Promise<boolean>
  
  // Cancelar convite
  static async cancelarConvite(conviteId: string): Promise<boolean>
  
  // Criar novo convite
  static async criarConvite(conviteData: ConviteCreateData): Promise<Convite>
  
  // Utilitários
  static isConviteExpirado(expira_em: string): boolean
  static getStatusInfo(status: Convite['status']): StatusInfo
}
```

## Tipos de Dados

### **Convite**
```typescript
interface Convite {
  id: string;
  email: string;
  organizacao_id: string;
  perfil_id: string;
  status: 'pendente' | 'aceito' | 'rejeitado' | 'expirado';
  token_invite: string;
  expira_em: string;
  convidado_por: string;
  created_at: string;
  aceito_em?: string;
  aceito_por?: string;
  rejeitado_em?: string;
  rejeitado_por?: string;
  
  // Relacionamentos
  organizacao?: { nome: string; tipo: string };
  perfil?: PerfilUsuario;
  convidado_por_usuario?: { nome: string; email: string };
}
```

## Fluxo de Trabalho

### **1. Gestor Cria Convite**
1. Acessa `/convites/create`
2. Preenche email, perfil e data de expiração
3. Sistema gera token único e envia convite
4. Convite aparece na aba "Pendentes"

### **2. Usuário Recebe Convite**
1. Recebe email com link de convite
2. Acessa link e vê detalhes do convite
3. Escolhe aceitar ou rejeitar

### **3. Sistema Processa Resposta**
1. **Aceito**: Usuário é adicionado à organização automaticamente
2. **Rejeitado**: Status é atualizado, usuário não é adicionado
3. **Expirado**: Sistema marca como expirado automaticamente

### **4. Gestor Acompanha**
1. Visualiza status em tempo real nas abas
2. Pode cancelar convites pendentes
3. Vê histórico completo de convites

## Integração com Sistema de Perfis

### **Atualização Automática**
- Quando convite é aceito, o `ProfileService` detecta mudança
- `TeamSwitcher` é atualizado automaticamente
- Novos perfis aparecem instantaneamente

### **Permissões**
- Apenas gestores podem criar convites
- Usuários podem aceitar/rejeitar convites enviados para eles
- Sistema respeita hierarquia de perfis

## Exemplo de Uso

### **Dashboard de Convites**
```typescript
import { useActiveProfile } from "@/hooks/usePermissions";
import { ConviteService } from "@/lib/services/conviteService";

function ConvitesDashboard() {
  const { organizacaoId } = useActiveProfile();
  const [convites, setConvites] = useState([]);

  useEffect(() => {
    if (organizacaoId) {
      loadConvites();
    }
  }, [organizacaoId]);

  const loadConvites = async () => {
    const data = await ConviteService.getConvitesByOrganization(organizacaoId);
    setConvites(data);
  };

  return (
    <div>
      <h1>Convites da Organização</h1>
      {/* Interface com abas e tabelas */}
    </div>
  );
}
```

## Benefícios

1. **Gestão Centralizada**: Todos os convites em um só lugar
2. **Tempo Real**: Atualizações automáticas via Supabase
3. **Interface Intuitiva**: Abas organizadas por status
4. **Ações Diretas**: Aceitar/rejeitar sem sair da lista
5. **Responsivo**: Funciona perfeitamente em mobile e desktop
6. **Integração**: Se conecta automaticamente com sistema de perfis

## Próximos Passos

- [ ] Sistema de notificações por email
- [ ] Templates de email personalizáveis
- [ ] Relatórios de convites
- [ ] Bulk actions (múltiplos convites)
- [ ] Histórico de mudanças de status
- [ ] Integração com sistema de auditoria
