# Análise de Migração - Sistema de Tipos

## 📊 Estado Atual

### Estrutura de Pastas

```
src/
├── app/api/                    # API Routes (Next.js)
│   ├── organization/
│   ├── products/
│   ├── location/
│   ├── profiles/
│   ├── permissions/
│   └── estoque/
├── lib/services/
│   ├── server/                 # Backend Services
│   │   ├── organizationService.ts
│   │   ├── productService.ts
│   │   ├── profileService.ts
│   │   └── permissionService.ts
│   ├── client/                 # Frontend Services
│   │   ├── organization-service.ts
│   │   ├── localidade-service.ts
│   │   ├── profile-service.ts
│   │   └── permission-service.ts
│   ├── labelService.ts         # Label service (client-side)
│   ├── etiquetaService.ts
│   ├── inviteService.ts
│   └── technicalSheetService.ts
└── types/                      # Sistema de Tipos (ANTIGO + NOVO)
    ├── organization.ts         # ❌ ANTIGO - Misto de concerns
    ├── localidade.ts          # ❌ ANTIGO - Tipos em português
    ├── uan.ts                 # ❌ ANTIGO - Tipos UAN específicos
    ├── etiquetas.ts           # ❌ ANTIGO - Label types
    ├── stock/                 # ❌ ANTIGO - Product/Stock types
    │   ├── product.ts
    │   └── stock.ts
    └── [NOVO SISTEMA]
        ├── database/           # ✅ Database entities (snake_case)
        ├── dto/               # ✅ API DTOs (camelCase)
        ├── models/            # ✅ Frontend models (Date, computed)
        ├── common/            # ✅ Pagination, API responses
        └── enums/             # ✅ Enums compartilhados
```

---

## 🔍 Análise por Camada

### 1. API Routes (`/app/api/`)

**Status:** 🟡 Parcialmente Estruturado

#### Características Atuais:

- ✅ Autenticação via Bearer token
- ✅ Supabase client server-side
- ✅ Uso de services backend
- ❌ Validação inconsistente de DTOs
- ❌ Respostas não padronizadas
- ❌ Tipos antigos misturados

#### Exemplo - `/api/organization/route.ts`:

```typescript
// ❌ Problemas Identificados:
// 1. Tipos antigos (Organization, OrganizationCreateInput)
// 2. Respostas não padronizadas ({ success, data } vs { data, error })
// 3. Sem validação de DTO de entrada
// 4. Conversão manual de casos

export async function POST(request: NextRequest) {
  // ...
  const requestData = await request.json(); // ❌ Sem validação
  const newOrganization = await organizationService.createOrganization({
    ...requestData,
    userId: user.id,
  });
  return NextResponse.json({ data: newOrganization }, { status: 201 });
}
```

#### Exemplo - `/api/products/route.ts`:

```typescript
// Similar aos outros - sem padrão consistente
export async function GET(request: NextRequest) {
  const organizationId = searchParams.get("organizationId");
  const products = await service.getProducts(organizationId);
  return NextResponse.json(products); // ❌ Sem wrapper padrão
}
```

#### Exemplo - `/api/location/city/route.ts`:

```typescript
// ❌ Normalização manual, sem DTOs
const normalized = {
  id: data.id,
  nome: data.name, // ❌ Misto de português/inglês
  estado: {
    id: data.state.id,
    codigo: data.state.code,
    nome: data.state.name,
  },
};
```

---

### 2. Backend Services (`/lib/services/server/`)

**Status:** 🟡 Funcional mas Despadronizado

#### Características:

- ✅ Classes separadas por domínio
- ✅ Uso de Supabase client injetado
- ✅ Uso de convertKeysToCamel/convertKeysToSnake
- ❌ Tipos antigos misturados
- ❌ Sem uso de Database Entities
- ❌ Retornos inconsistentes

#### Exemplo - `organizationService.ts`:

```typescript
import { Organization, OrganizationCreateInput } from "@/types/organization"; // ❌ Tipos antigos

export class OrganizationBackendService {
  async listByUserId(userId: string): Promise<Organization[]> {
    // ❌ Deveria retornar OrganizationEntity[]
    const { data, error } = await this.supabase
      .from("organizations")
      .select("*")
      .eq("user_id", userId);

    return convertKeysToCamel<Organization[]>(data ?? []); // ❌ Conversão para tipo antigo
  }

  async createOrganization(
    org: OrganizationCreateInput
  ): Promise<Organization> {
    const payload = convertKeysToSnake(JSON.parse(JSON.stringify(org))); // ❌ JSON.parse hack
    // ...
  }

  async getByIdExpanded(id: string) {
    // ❌ Retorno não tipado
    const { data } = await this.supabase
      .from("organizations")
      .select(
        `
        *,
        state:states(*),
        city:cities(*, state:states(*))
      `
      )
      .eq("id", id)
      .single();
    return data; // ❌ Tipo implícito 'any'
  }
}
```

#### Exemplo - `productService.ts`:

```typescript
import { Product, ProductGroup } from "@/types/stock/product"; // ❌ Tipos antigos

export class ProductBackendService {
  async getProducts(organizationId: string): Promise<Product[]> {
    const { data } = await this.supabase
      .from("products")
      .select(
        `
        *,
        group:groups(*)
      `
      )
      .eq("organization_id", organizationId);
    return data || []; // ❌ Sem conversão de casos
  }
}
```

---

### 3. Frontend Services (`/lib/services/client/`)

**Status:** 🟡 Funcional mas Inconsistente

#### Características:

- ✅ Uso de apiClient (axios)
- ✅ Agrupamento por funcionalidade
- ❌ Tipos antigos
- ❌ Respostas não padronizadas
- ❌ Sem hooks React Query consistentes

#### Exemplo - `organization-service.ts`:

```typescript
import { Organization, OrganizationCreateInput } from "@/types/organization"; // ❌ Tipos antigos

interface OrganizationApiResponse {
  // ❌ DTO ad-hoc, não reutilizável
  success: boolean;
  data?: Organization[];
  error?: string;
}

export const OrganizationService = {
  async getOrganizations(): Promise<Organization[]> {
    const { data: response } = await api.get<OrganizationApiResponse>(
      "/organization"
    );

    if (!response.success || !response.data) {
      // ❌ Validação manual
      throw new Error(
        response.error || "Não foi possível carregar as organizações"
      );
    }

    return response.data;
  },

  async createOrganization(
    organization: OrganizationCreateInput
  ): Promise<Organization> {
    const { data: response } = await api.post<{
      // ❌ Tipo inline
      data: Organization;
      error?: string;
      message?: string;
    }>("/organization", { ...organization });

    return response.data;
  },
};
```

#### Exemplo - `localidade-service.ts`:

```typescript
import {
  Estado,
  Municipio,
  MunicipioResponse,
  ViaCEPResponse,
} from "@/types/localidade"; // ❌ Português

export const LocationService = {
  async fetchCEP(cep: string): Promise<ViaCEPResponse | null> {
    // ...
  },

  async fetchOrCreateCity(zipCode: string): Promise<MunicipioResponse | null> {
    const { data } = await api.post("/location/city", { cep: zipCode });
    return data; // ❌ Sem validação
  },
};
```

---

### 4. Outros Services (Root Level)

**Status:** 🔴 Desorganizado

#### Arquivos:

- `labelService.ts` - Client-side, usa Supabase diretamente
- `etiquetaService.ts` - Duplicado?
- `inviteService.ts` - Misto de client/server
- `technicalSheetService.ts` - Funcionalidade específica

#### Problema:

- ❌ Mistura de client/server concerns
- ❌ Uso direto do Supabase client (não via API)
- ❌ Sem padronização de estrutura

---

## 🎯 Tipos Antigos vs Novos

### Tipos Antigos (A Migrar)

| Arquivo                  | Problema                                     | Uso Atual        |
| ------------------------ | -------------------------------------------- | ---------------- |
| `types/organization.ts`  | Misto de database/frontend, português/inglês | 30+ arquivos     |
| `types/localidade.ts`    | Tudo em português, sem DTOs                  | 15+ arquivos     |
| `types/uan.ts`           | Específico demais, misturado com org         | 10+ arquivos     |
| `types/etiquetas.ts`     | Sem separação concerns                       | Label components |
| `types/stock/product.ts` | Sem DTOs, types misturados                   | Products/Stock   |
| `types/stock/stock.ts`   | Movimento de estoque complexo                | Estoque module   |

### Novo Sistema de Tipos (Criado)

| Camada            | Status      | Arquivos                                             |
| ----------------- | ----------- | ---------------------------------------------------- |
| `types/database/` | ✅ Completo | 4 módulos (organization, location, product, profile) |
| `types/dto/`      | ✅ Completo | 6 módulos (request/response)                         |
| `types/models/`   | ✅ Completo | 4 módulos (frontend models)                          |
| `types/common/`   | ✅ Completo | pagination.ts, api.ts                                |
| `types/enums/`    | ✅ Completo | organization, label, user                            |

---

## 📋 Plano de Migração Sugerido

### Fase 1: Backend Services (Prioridade Alta)

**Objetivo:** Migrar services backend para usar Database Entities e DTOs

#### Tarefas:

1. **organizationService.ts**

   - [ ] Importar `OrganizationEntity` de `/types/database/organization`
   - [ ] Importar DTOs de `/types/dto/organization`
   - [ ] Métodos devem retornar Entities internamente
   - [ ] Criar converters: Entity → ResponseDto

2. **productService.ts**

   - [ ] Usar `ProductEntity` de `/types/database/product`
   - [ ] Usar DTOs de `/types/dto/product`
   - [ ] Criar converters

3. **profileService.ts** e **permissionService.ts**
   - [ ] Migrar para tipos de `/types/database/profile`
   - [ ] Usar DTOs de `/types/dto/profile`

#### Benefícios:

- ✅ Tipo-safe com database schema
- ✅ Conversões explícitas e testáveis
- ✅ Preparação para API routes

---

### Fase 2: API Routes (Prioridade Alta)

**Objetivo:** Padronizar rotas com DTOs e respostas consistentes

#### Tarefas:

1. **Criar validators/parsers de DTOs**

   - [ ] Função `validateDto<T>(schema, data): T`
   - [ ] Usar Zod ou class-validator

2. **Padronizar respostas**

   - [ ] Todos retornam `ApiResponse<T>`
   - [ ] Usar `ApiErrorResponse` para erros
   - [ ] Helper `createApiResponse<T>(data: T): ApiSuccessResponse<T>`

3. **Migrar rotas específicas**
   - [ ] `/api/organization/route.ts` - usar `CreateOrganizationDto`, `OrganizationResponseDto`
   - [ ] `/api/products/route.ts` - usar `CreateProductDto`, `ProductResponseDto`
   - [ ] `/api/location/city/route.ts` - usar `SearchCityByZipCodeDto`, `CityResponseDto`

#### Exemplo Após Migração:

```typescript
// /api/organization/route.ts
import { CreateOrganizationDto } from "@/types/dto/organization/request";
import { OrganizationResponseDto } from "@/types/dto/organization/response";
import { ApiSuccessResponse } from "@/types/common/api";

export async function POST(request: NextRequest) {
  const token = extractToken(request);
  const user = await authenticateUser(token);

  const body = await request.json();
  const dto = validateDto(CreateOrganizationDto, body); // ✅ Validado

  const service = new OrganizationBackendService(supabase);
  const entity = await service.createOrganization(dto);
  const response = toOrganizationResponseDto(entity); // ✅ Converter explicitamente

  return NextResponse.json(
    createApiResponse(response), // ✅ Padronizado
    { status: 201 }
  );
}
```

---

### Fase 3: Frontend Services (Prioridade Média)

**Objetivo:** Usar Models e DTOs no frontend

#### Tarefas:

1. **organization-service.ts**

   - [ ] Usar `CreateOrganizationDto` para requests
   - [ ] Receber `OrganizationResponseDto` das APIs
   - [ ] Converter para `Organization` (model) para uso no frontend

2. **localidade-service.ts**

   - [ ] Migrar para inglês (LocationService já existe)
   - [ ] Usar `CityResponseDto`, `StateResponseDto`

3. **Criar hooks React Query**
   - [ ] `useOrganizations()` - retorna `Organization[]` (models)
   - [ ] `useProducts()` - retorna `Product[]` (models)
   - [ ] `useProfiles()` - retorna `Profile[]` (models)

#### Exemplo:

```typescript
// organization-service.ts (DEPOIS)
import { CreateOrganizationDto } from "@/types/dto/organization/request";
import { OrganizationResponseDto } from "@/types/dto/organization/response";
import { Organization } from "@/types/models/organization";
import { ApiSuccessResponse } from "@/types/common/api";

export const OrganizationService = {
  async getOrganizations(): Promise<Organization[]> {
    const { data } = await api.get<
      ApiSuccessResponse<OrganizationResponseDto[]>
    >("/organization");

    return data.data.map(toOrganizationModel); // ✅ Converter DTO → Model
  },

  async createOrganization(
    input: CreateOrganizationDto
  ): Promise<Organization> {
    const { data } = await api.post<
      ApiSuccessResponse<OrganizationResponseDto>
    >("/organization", input);

    return toOrganizationModel(data.data);
  },
};

// Converter DTO → Model
function toOrganizationModel(dto: OrganizationResponseDto): Organization {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    openingDate: dto.openingDate ? new Date(dto.openingDate) : undefined,
    formattedCnpj: formatCnpj(dto.cnpj),
    // ... outros computed fields
  };
}
```

---

### Fase 4: Utilities e Converters (Prioridade Alta)

**Objetivo:** Criar funções reutilizáveis de conversão

#### Tarefas:

1. **Criar `/lib/converters/organization.ts`**

```typescript
import { OrganizationEntity } from "@/types/database/organization";
import {
  OrganizationResponseDto,
  OrganizationExpandedResponseDto,
} from "@/types/dto/organization/response";
import { Organization } from "@/types/models/organization";

// Database Entity → Response DTO
export function toOrganizationResponseDto(
  entity: OrganizationEntity
): OrganizationResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    type: entity.type,
    cnpj: entity.cnpj,
    uanType: entity.uan_type,
    capacity: entity.capacity,
    openingDate: entity.opening_date,
    stateId: entity.state_id,
    cityId: entity.city_id,
    zipCode: entity.zip_code,
    address: entity.address,
    number: entity.number,
    addressComplement: entity.address_complement,
    district: entity.district,
    mainPhone: entity.main_phone,
    altPhone: entity.alt_phone,
    institutionalEmail: entity.institutional_email,
    userId: entity.user_id,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

// Response DTO → Frontend Model
export function toOrganizationModel(
  dto: OrganizationResponseDto
): Organization {
  return {
    ...dto,
    createdAt: new Date(dto.createdAt),
    updatedAt: dto.updatedAt ? new Date(dto.updatedAt) : undefined,
    openingDate: dto.openingDate ? new Date(dto.openingDate) : undefined,
    formattedCnpj: formatCnpj(dto.cnpj),
    formattedMainPhone: formatPhone(dto.mainPhone),
    formattedAltPhone: formatPhone(dto.altPhone),
  };
}

// Request DTO → Database Entity (para insert)
export function toOrganizationEntity(
  dto: CreateOrganizationDto
): Partial<OrganizationEntity> {
  return {
    name: dto.name,
    type: dto.type,
    cnpj: dto.cnpj,
    uan_type: dto.uanType,
    capacity: dto.capacity,
    opening_date: dto.openingDate,
    state_id: dto.stateId,
    city_id: dto.cityId,
    zip_code: dto.zipCode,
    address: dto.address,
    number: dto.number,
    address_complement: dto.addressComplement,
    district: dto.district,
    main_phone: dto.mainPhone,
    alt_phone: dto.altPhone,
    institutional_email: dto.institutionalEmail,
    user_id: dto.userId,
  };
}
```

2. **Criar converters para outros módulos**
   - [ ] `/lib/converters/product.ts`
   - [ ] `/lib/converters/location.ts`
   - [ ] `/lib/converters/profile.ts`

---

### Fase 5: Remover Tipos Antigos (Prioridade Baixa)

**Objetivo:** Limpar código legacy

#### Tarefas:

1. [ ] Deletar `/types/organization.ts`
2. [ ] Deletar `/types/localidade.ts`
3. [ ] Deletar `/types/uan.ts`
4. [ ] Deletar `/types/etiquetas.ts`
5. [ ] Deletar `/types/stock/`
6. [ ] Atualizar todos os imports

---

## 🚀 Recomendação de Início

### Piloto: Módulo Organizations

**Por quê?**

- ✅ Já tem novo sistema de tipos completo
- ✅ Tem backend service, API route, frontend service
- ✅ Relativamente isolado
- ✅ Serve de template para outros módulos

**Checklist do Piloto:**

1. **Backend Service** (`organizationService.ts`)

   - [ ] Criar `/lib/converters/organization.ts`
   - [ ] Migrar métodos para usar `OrganizationEntity`
   - [ ] Métodos retornam Entities, não DTOs

2. **API Route** (`/api/organization/route.ts`)

   - [ ] Validar entrada com DTOs
   - [ ] Usar converters: Entity → ResponseDto
   - [ ] Padronizar respostas com `ApiResponse<T>`

3. **Frontend Service** (`organization-service.ts`)

   - [ ] Usar DTOs em requests/responses
   - [ ] Converter DTOs → Models
   - [ ] Retornar Models para componentes

4. **Hooks** (criar `useOrganizations.ts`)

   - [ ] Usar React Query
   - [ ] Retornar `Organization[]` (models)

5. **Componentes**
   - [ ] Atualizar imports para usar models
   - [ ] Testar funcionamento

---

## 📊 Resumo de Impacto

### Arquivos a Migrar

| Categoria               | Quantidade   | Prioridade |
| ----------------------- | ------------ | ---------- |
| Backend Services        | 4 arquivos   | 🔴 Alta    |
| API Routes              | ~15 rotas    | 🔴 Alta    |
| Frontend Services       | 4 arquivos   | 🟡 Média   |
| Converters (criar)      | 4 arquivos   | 🔴 Alta    |
| Hooks (criar/atualizar) | ~10 arquivos | 🟡 Média   |
| Componentes             | 30+ arquivos | 🟢 Baixa   |
| Tipos Antigos (deletar) | 6 arquivos   | 🟢 Baixa   |

### Estimativa de Esforço

- **Fase 1 (Backend Services):** 2-3 horas
- **Fase 2 (API Routes):** 3-4 horas
- **Fase 3 (Frontend Services):** 2-3 horas
- **Fase 4 (Converters):** 1-2 horas
- **Fase 5 (Cleanup):** 1 hora

**Total:** ~10-15 horas para migração completa

---

## ✅ Próximos Passos Imediatos

1. **Revisar este documento** com a equipe
2. **Decidir abordagem:** Migração gradual vs Big Bang
3. **Começar pelo piloto:** Organizations module
4. **Criar converters** para Organizations
5. **Validar** com testes e uso real
6. **Replicar** padrão para outros módulos

---

## 📝 Notas Técnicas

### Vantagens da Nova Estrutura

✅ **Tipo-safe em todas as camadas**
✅ **Separação clara de concerns** (database/API/frontend)
✅ **Conversões explícitas e testáveis**
✅ **Padronização de respostas** de API
✅ **Código em inglês** (melhor manutenibilidade)
✅ **Reutilização** de tipos comuns (pagination, etc.)

### Desafios

⚠️ **Migração gradual** - Tipos antigos e novos coexistirão temporariamente
⚠️ **Muitos arquivos** para atualizar (30+ imports)
⚠️ **Testes** necessários após cada fase
⚠️ **Coordenação** se múltiplos devs trabalhando

### Mitigações

✅ **Piloto primeiro** - Validar abordagem com Organizations
✅ **Converters centralizados** - Facilita manutenção
✅ **Scripts de migração** - Automatizar updates de imports
✅ **Documentação clara** - Este arquivo + exemplos
