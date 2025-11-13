# Sistema de Tipos - Guia Rápido

## 📦 Camadas de Tipos

### 1. **Entity** - Camada de Banco de Dados

**Pasta:** `/src/types/database/`

```typescript
// Exemplo: organization.ts
export interface OrganizationEntity {
  id: string;
  name: string;
  main_phone: string | null; // snake_case
  created_at: string; // ISO string
  updated_at: string; // ISO string
}
```

✅ **Características:**

- `snake_case` (exatamente como no banco)
- Datas como `string` (ISO format)
- Sem campos computados
- Representa exatamente a tabela do PostgreSQL

---

### 2. **DTO** - Camada de API (Transfer)

**Pasta:** `/src/types/dto/{module}/`

```typescript
// request.ts
export interface CreateOrganizationDto {
  name: string;
  mainPhone?: string; // camelCase
}

export interface UpdateOrganizationDto {
  name?: string;
  mainPhone?: string; // camelCase, opcional
}

// response.ts
export interface OrganizationResponseDto {
  id: string;
  name: string;
  mainPhone: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
```

✅ **Características:**

- `camelCase` (padrão JavaScript)
- Datas como `string` (serializável para JSON)
- Sem campos computados
- Otimizado para transporte HTTP
- Separar Request/Response

---

### 3. **Model** - Camada de Frontend

**Pasta:** `/src/types/models/`

```typescript
// organization.ts
export interface Organization {
  id: string;
  name: string;
  mainPhone: string | null;
  createdAt: Date; // Date object
  updatedAt: Date; // Date object

  // Campos computados
  formattedPhone?: string;
  isNew?: boolean;
}
```

✅ **Características:**

- `camelCase` (padrão JavaScript)
- Datas como `Date` (fácil manipulação)
- Pode ter campos computados
- Rico em lógica de negócio
- Usado nos componentes React

---

## 🔄 Conversores

**Pasta:** `/lib/converters/{module}.ts`

```typescript
// Entity → DTO
export function toOrganizationResponseDto(
  entity: OrganizationEntity
): OrganizationResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    mainPhone: entity.main_phone, // snake → camel
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

// DTO → Model
export function toOrganizationModel(
  dto: OrganizationResponseDto
): Organization {
  return {
    id: dto.id,
    name: dto.name,
    mainPhone: dto.mainPhone,
    createdAt: new Date(dto.createdAt), // string → Date
    updatedAt: new Date(dto.updatedAt), // string → Date

    // Campos computados
    formattedPhone: dto.mainPhone ? formatPhone(dto.mainPhone) : undefined,
  };
}

// DTO → Entity (Create)
export function toOrganizationEntityForCreate(
  dto: CreateOrganizationDto,
  userId: string
): Partial<OrganizationEntity> {
  return {
    name: dto.name,
    main_phone: dto.mainPhone, // camel → snake
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// DTO → Entity (Update)
export function toOrganizationEntityForUpdate(
  dto: UpdateOrganizationDto
): Partial<OrganizationEntity> {
  const update: Partial<OrganizationEntity> = {
    updated_at: new Date().toISOString(),
  };

  if (dto.name !== undefined) update.name = dto.name;
  if (dto.mainPhone !== undefined) update.main_phone = dto.mainPhone;

  return update;
}
```

---

## 📂 Estrutura de Arquivos

```
src/types/
├── database/                    # Entities (snake_case)
│   ├── organization.ts
│   ├── profile.ts
│   ├── product.ts
│   └── index.ts
│
├── dto/                         # DTOs (camelCase, strings)
│   ├── organization/
│   │   ├── request.ts           # Create, Update DTOs
│   │   ├── response.ts          # Response DTOs
│   │   └── index.ts
│   ├── profile/
│   └── index.ts
│
├── models/                      # Models (camelCase, Date objects)
│   ├── organization.ts
│   ├── profile.ts
│   ├── product.ts
│   └── index.ts
│
└── enums/                       # Enums compartilhados
    └── organization.ts

src/lib/
├── converters/                  # Lógica de conversão
│   ├── organization.ts
│   ├── profile.ts
│   └── index.ts
│
└── services/
    ├── client/                  # Frontend (usa DTO ↔ Model)
    │   └── organization-service.ts
    │
    └── server/                  # Backend (usa Entity ↔ DTO)
        └── organizationService.ts

src/app/api/                     # API Routes (usa apenas DTO)
└── organization/
    └── route.ts
```

---

## 🎯 Fluxo de Dados

```
DATABASE                  BACKEND SERVICE          API ROUTE           FRONTEND SERVICE        COMPONENT
(Entity)                 (Entity ↔ DTO)           (DTO only)          (DTO ↔ Model)          (Model only)

organizations    →→→→   OrganizationEntity   →→→  DTO  →→→  HTTP  →→→  DTO  →→→  Model  →→→  Organization
(snake_case)          toResponseDto()                               toModel()             (Date objects)
```

**Regra de Ouro:** Cada camada só conhece seus próprios tipos!

---

## ✅ Checklist para Nova Entidade

Ao adicionar uma nova tabela/entidade no sistema:

- [ ] **1. Migration** - Criar migration SQL em `/supabase/migrations/`
- [ ] **2. Entity** - Criar `{Name}Entity` em `/types/database/{name}.ts`
- [ ] **3. DTOs** - Criar em `/types/dto/{name}/`:
  - [ ] `Create{Name}Dto`, `Update{Name}Dto` em `request.ts`
  - [ ] `{Name}ResponseDto` em `response.ts`
- [ ] **4. Model** - Criar `{Name}` em `/types/models/{name}.ts`
- [ ] **5. Converters** - Criar em `/lib/converters/{name}.ts`:
  - [ ] `to{Name}ResponseDto(entity → dto)`
  - [ ] `to{Name}Model(dto → model)`
  - [ ] `to{Name}EntityForCreate(dto → entity)`
  - [ ] `to{Name}EntityForUpdate(dto → entity)`
- [ ] **6. Backend Service** - Criar `{Name}BackendService` em `/lib/services/server/`
- [ ] **7. API Routes** - Criar rotas em `/app/api/{name}/route.ts`
- [ ] **8. Frontend Service** - Criar `{Name}Service` em `/lib/services/client/`
- [ ] **9. Hook** - Criar `use{Name}` com React Query (opcional)
- [ ] **10. Exports** - Atualizar `index.ts` em cada pasta

---

## 🔍 Padrões de Nomenclatura

### Arquivos

- Entity: `{name}.ts` (singular) → `organization.ts`
- DTO: `{module}/request.ts`, `{module}/response.ts`
- Model: `{name}.ts` (singular) → `organization.ts`
- Converter: `{module}.ts` → `organization.ts`
- Service Client: `{module}-service.ts` → `organization-service.ts`
- Service Server: `{module}Service.ts` → `organizationService.ts`

### Interfaces

- Entity: `{Name}Entity` → `OrganizationEntity`
- Request DTO: `Create{Name}Dto`, `Update{Name}Dto`
- Response DTO: `{Name}ResponseDto`
- Model: `{Name}` → `Organization`

### Funções (Converters)

- `to{Name}ResponseDto(entity)` → Entity para DTO
- `to{Name}Model(dto)` → DTO para Model
- `to{Name}EntityForCreate(dto)` → DTO para Entity (create)
- `to{Name}EntityForUpdate(dto)` → DTO para Entity (update)
- `validate{Field}(value)` → Validação
- `format{Field}(value)` → Formatação
- `clean{Type}(value)` → Limpeza

---

## 🚨 Erros Comuns

### ❌ NÃO FAÇA

```typescript
// ❌ Usar Date em DTO
export interface OrganizationResponseDto {
  createdAt: Date; // ERRADO! Não é serializável
}

// ❌ Usar snake_case em Model
export interface Organization {
  main_phone: string; // ERRADO! Use camelCase
}

// ❌ Usar camelCase em Entity
export interface OrganizationEntity {
  mainPhone: string; // ERRADO! Use snake_case
}

// ❌ Acessar Supabase direto do frontend
const { data } = await supabase.from('organizations')...

// ❌ Retornar Entity na API
return NextResponse.json(entity); // ERRADO! Use DTO

// ❌ Usar Model no Backend Service
service.create(organization: Organization) // ERRADO! Use DTO
```

### ✅ FAÇA

```typescript
// ✅ DTO com string
export interface OrganizationResponseDto {
  createdAt: string; // ISO string
}

// ✅ Model com camelCase e Date
export interface Organization {
  mainPhone: string | null;
  createdAt: Date;
}

// ✅ Entity com snake_case
export interface OrganizationEntity {
  main_phone: string | null;
  created_at: string;
}

// ✅ Usar Frontend Service
const org = await organizationService.getById(id);

// ✅ Retornar DTO na API
return NextResponse.json(dto);

// ✅ Backend Service usa DTO
service.create(dto: CreateOrganizationDto)
```

---

## 📘 Exemplos Completos

Ver arquivo `ARCHITECTURE_PATTERN.md` para exemplos completos de:

- Fluxo completo de criação
- Estrutura de módulo
- Melhores práticas detalhadas
