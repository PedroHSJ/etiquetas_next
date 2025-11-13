# Architecture Pattern - Three-Layer Type System

## 📋 Overview

Este projeto segue uma arquitetura de três camadas com sistema de tipos bem definido para separação de responsabilidades e transformação de dados entre camadas.

## 🏗️ Three-Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (React/Next.js)                  │
│  - Components use Models (camelCase, Date objects)          │
│  - UI logic, rendering, user interactions                   │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              FRONTEND HOOK (React Query/Custom)              │
│  - State management, data fetching orchestration            │
│  - Receives Models from Frontend Service                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         FRONTEND SERVICE (/lib/services/client/)             │
│  - Axios HTTP calls to API routes                           │
│  - Converts DTOs → Models (using converters)                │
│  - Converts Models → DTOs for requests                      │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTP (DTOs)
                       ▼
┌─────────────────────────────────────────────────────────────┐
│              API ROUTES (/app/api/**/route.ts)               │
│  - Request validation (Zod schemas)                         │
│  - Authentication/authorization checks                      │
│  - Receives DTOs, returns DTOs                              │
│  - Calls Backend Service                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│         BACKEND SERVICE (/lib/services/server/)              │
│  - Business logic, data validation                          │
│  - Converts DTOs → Entities (using converters)              │
│  - Converts Entities → DTOs (using converters)              │
│  - Calls Supabase client                                    │
└──────────────────────┬──────────────────────────────────────┘
                       │ SQL
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  DATABASE (PostgreSQL/Supabase)              │
│  - Tables with snake_case columns                           │
│  - Returns Entities (snake_case)                            │
└─────────────────────────────────────────────────────────────┘
```

## 📦 Type System Layers

### 1. Database Entities (`/types/database/`)

**Purpose:** Exact representation of database tables (snake_case)

```typescript
// /types/database/organization.ts
export interface OrganizationEntity {
  id: string;
  name: string;
  type: string;
  cnpj: string | null;
  main_phone: string | null;
  secondary_phone: string | null;
  created_at: string;
  updated_at: string;
  user_id: string;
  // ... outros campos do banco
}
```

**Characteristics:**

- ✅ snake_case (matches database columns)
- ✅ All fields as returned by Supabase
- ✅ Dates as ISO strings
- ✅ No computed fields
- ✅ Nullable fields explicitly marked

### 2. DTOs - Data Transfer Objects (`/types/dto/`)

**Purpose:** API communication layer (camelCase, optimized for transport)

```typescript
// /types/dto/organization/request.ts
export interface CreateOrganizationDto {
  name: string;
  type: string;
  cnpj?: string;
  mainPhone?: string;
  secondaryPhone?: string;
  // ... campos necessários para criação
}

export interface UpdateOrganizationDto {
  name?: string;
  type?: string;
  cnpj?: string;
  mainPhone?: string;
  // ... campos opcionais para atualização
}

// /types/dto/organization/response.ts
export interface OrganizationResponseDto {
  id: string;
  name: string;
  type: string;
  cnpj: string | null;
  mainPhone: string | null;
  secondaryPhone: string | null;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}
```

**Characteristics:**

- ✅ camelCase (JavaScript convention)
- ✅ Dates as ISO strings (serializable)
- ✅ Separate Request/Response DTOs
- ✅ No computed fields
- ✅ Optimized for HTTP transport

### 3. Frontend Models (`/types/models/`)

**Purpose:** Rich domain models for UI/business logic (camelCase, Date objects)

```typescript
// /types/models/organization.ts
export interface Organization {
  id: string;
  name: string;
  type: string;
  cnpj: string | null;
  mainPhone: string | null;
  secondaryPhone: string | null;
  createdAt: Date; // Date object for manipulation
  updatedAt: Date; // Date object for manipulation

  // Computed fields
  formattedCnpj?: string;
  formattedMainPhone?: string;
  formattedSecondaryPhone?: string;
}
```

**Characteristics:**

- ✅ camelCase (JavaScript convention)
- ✅ Dates as Date objects (easy manipulation)
- ✅ Computed/derived fields
- ✅ Business logic properties
- ✅ UI-friendly format

## 🔄 Converters (`/lib/converters/`)

**Purpose:** Transform data between layers, centralize business rules

```typescript
// /lib/converters/organization.ts

// ============= Validation & Formatting =============
export function validateCNPJ(cnpj: string): boolean {
  /* ... */
}
export function formatCNPJ(cnpj: string): string {
  /* ... */
}
export function formatPhone(phone: string): string {
  /* ... */
}
export function cleanNumericString(value: string): string {
  /* ... */
}

// ============= Entity → DTO =============
export function toOrganizationResponseDto(
  entity: OrganizationEntity
): OrganizationResponseDto {
  return {
    id: entity.id,
    name: entity.name,
    type: entity.type,
    cnpj: entity.cnpj,
    mainPhone: entity.main_phone,
    secondaryPhone: entity.secondary_phone,
    createdAt: entity.created_at,
    updatedAt: entity.updated_at,
  };
}

// ============= DTO → Model =============
export function toOrganizationModel(
  dto: OrganizationResponseDto
): Organization {
  return {
    id: dto.id,
    name: dto.name,
    type: dto.type,
    cnpj: dto.cnpj,
    mainPhone: dto.mainPhone,
    secondaryPhone: dto.secondaryPhone,
    createdAt: new Date(dto.createdAt), // ISO string → Date
    updatedAt: new Date(dto.updatedAt), // ISO string → Date

    // Computed fields
    formattedCnpj: dto.cnpj ? formatCNPJ(dto.cnpj) : undefined,
    formattedMainPhone: dto.mainPhone ? formatPhone(dto.mainPhone) : undefined,
    formattedSecondaryPhone: dto.secondaryPhone
      ? formatPhone(dto.secondaryPhone)
      : undefined,
  };
}

// ============= DTO → Entity (for create) =============
export function toOrganizationEntityForCreate(
  dto: CreateOrganizationDto,
  userId: string
): Partial<OrganizationEntity> {
  return {
    name: dto.name,
    type: dto.type,
    cnpj: dto.cnpj ? cleanNumericString(dto.cnpj) : null,
    main_phone: dto.mainPhone ? cleanNumericString(dto.mainPhone) : null,
    secondary_phone: dto.secondaryPhone
      ? cleanNumericString(dto.secondaryPhone)
      : null,
    user_id: userId,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
}

// ============= DTO → Entity (for update) =============
export function toOrganizationEntityForUpdate(
  dto: UpdateOrganizationDto
): Partial<OrganizationEntity> {
  const updateData: Partial<OrganizationEntity> = {
    updated_at: new Date().toISOString(), // Always update timestamp
  };

  if (dto.name !== undefined) updateData.name = dto.name;
  if (dto.type !== undefined) updateData.type = dto.type;
  if (dto.cnpj !== undefined) updateData.cnpj = cleanNumericString(dto.cnpj);
  if (dto.mainPhone !== undefined)
    updateData.main_phone = cleanNumericString(dto.mainPhone);
  if (dto.secondaryPhone !== undefined)
    updateData.secondary_phone = cleanNumericString(dto.secondaryPhone);

  return updateData;
}
```

## 📂 File Structure

```
src/
├── types/
│   ├── database/           # Database Entities (snake_case)
│   │   ├── organization.ts
│   │   ├── user.ts
│   │   ├── profile.ts
│   │   └── permission.ts
│   │
│   ├── dto/               # Data Transfer Objects (camelCase, strings)
│   │   ├── organization/
│   │   │   ├── request.ts
│   │   │   └── response.ts
│   │   ├── user/
│   │   │   ├── request.ts
│   │   │   └── response.ts
│   │   └── profile/
│   │       ├── request.ts
│   │       └── response.ts
│   │
│   └── models/            # Frontend Models (camelCase, Date objects)
│       ├── organization.ts
│       ├── user.ts
│       ├── profile.ts
│       └── permission.ts
│
├── lib/
│   ├── converters/        # Conversion logic + business rules
│   │   ├── organization.ts
│   │   ├── user.ts
│   │   └── profile.ts
│   │
│   └── services/
│       ├── client/        # Frontend Services (axios)
│       │   ├── organization-service.ts
│       │   ├── user-service.ts
│       │   └── profile-service.ts
│       │
│       └── server/        # Backend Services (Supabase)
│           ├── organizationService.ts
│           ├── userService.ts
│           └── profileService.ts
│
└── app/
    └── api/               # API Routes
        ├── organization/
        │   ├── route.ts
        │   ├── setup/
        │   └── expanded/
        ├── user/
        └── profile/
```

## 🔄 Data Flow Example

### Creating an Organization

```typescript
// 1. FRONTEND COMPONENT
const handleSubmit = async (formData) => {
  const dto: CreateOrganizationDto = {
    name: formData.name,
    type: formData.type,
    cnpj: formData.cnpj,
    mainPhone: formData.mainPhone,
  };

  const organization = await organizationService.createOrganization(dto);
  // organization is Organization model (Date objects, computed fields)
};

// 2. FRONTEND SERVICE (/lib/services/client/organization-service.ts)
export class OrganizationService {
  static async createOrganization(
    dto: CreateOrganizationDto
  ): Promise<Organization> {
    const response = await apiClient.post<OrganizationResponseDto>(
      "/api/organization",
      dto
    );

    return toOrganizationModel(response.data); // DTO → Model
  }
}

// 3. API ROUTE (/app/api/organization/route.ts)
export async function POST(request: NextRequest) {
  const token = request.headers.get("authorization")?.replace("Bearer ", "");
  const payload = await validateToken(token);

  const body: CreateOrganizationDto = await request.json();

  const organizationService = new OrganizationBackendService(supabase);
  const dto = await organizationService.createOrganization(body, payload.sub);

  return NextResponse.json({
    success: true,
    data: dto, // Returns DTO
  });
}

// 4. BACKEND SERVICE (/lib/services/server/organizationService.ts)
export class OrganizationBackendService {
  async createOrganization(
    dto: CreateOrganizationDto,
    userId: string
  ): Promise<OrganizationResponseDto> {
    // Convert DTO → Entity (apply business rules)
    const entity = toOrganizationEntityForCreate(dto, userId);

    const { data, error } = await this.supabase
      .from("organizations")
      .insert(entity)
      .select()
      .single();

    if (error) throw error;

    // Convert Entity → DTO
    return toOrganizationResponseDto(data);
  }
}
```

## ✅ Best Practices

### DO's ✅

1. **Always use converters** for transformations
2. **Keep business rules in converters** (validation, formatting, cleaning)
3. **Use proper layer types**:
   - Components → Models
   - Frontend Services → DTOs ↔ Models
   - API Routes → DTOs
   - Backend Services → DTOs ↔ Entities
4. **Never access Supabase directly from frontend**
5. **Use React Query for data fetching in hooks**
6. **Centralize validation logic in converters**
7. **Keep computed fields only in Models**

### DON'Ts ❌

1. ❌ Don't mix snake_case and camelCase in same layer
2. ❌ Don't use Date objects in DTOs (not serializable)
3. ❌ Don't duplicate business rules across layers
4. ❌ Don't access database from frontend components
5. ❌ Don't bypass converters for "quick fixes"
6. ❌ Don't put computed fields in Entities or DTOs
7. ❌ Don't use Models in API responses

## 🎯 Migration Checklist

When migrating a module to this pattern:

- [ ] Create Database Entity interface (`/types/database/`)
- [ ] Create Request DTOs (`/types/dto/{module}/request.ts`)
- [ ] Create Response DTOs (`/types/dto/{module}/response.ts`)
- [ ] Create Frontend Model (`/types/models/`)
- [ ] Create Converters with all business rules (`/lib/converters/`)
- [ ] Migrate Backend Service to use Entities + Converters
- [ ] Migrate API Routes to use DTOs
- [ ] Migrate Frontend Service to use DTOs + Converters
- [ ] Update Hooks to use Frontend Service
- [ ] Update Components to use Models
- [ ] Test complete flow
- [ ] Verify no business rules were lost

## 📝 Naming Conventions

### Files

- Database Entities: `{entity}.ts` (singular)
- DTOs: `{module}/request.ts`, `{module}/response.ts`
- Models: `{model}.ts` (singular)
- Converters: `{module}.ts`
- Services: `{module}-service.ts` (client), `{module}Service.ts` (server)

### Interfaces

- Entity: `{Name}Entity` (e.g., `OrganizationEntity`)
- Request DTO: `Create{Name}Dto`, `Update{Name}Dto`
- Response DTO: `{Name}ResponseDto`, `{Name}ExpandedResponseDto`
- Model: `{Name}` (e.g., `Organization`)

### Functions (in converters)

- Entity → DTO: `to{Name}ResponseDto(entity)`
- DTO → Model: `to{Name}Model(dto)`
- DTO → Entity (create): `to{Name}EntityForCreate(dto)`
- DTO → Entity (update): `to{Name}EntityForUpdate(dto)`
- Validation: `validate{Field}(value)`
- Formatting: `format{Field}(value)`
- Cleaning: `clean{Type}String(value)`

## 🔍 Example: Complete Module Structure

```
Organization Module
├── Database Entity: OrganizationEntity (snake_case, DB columns)
├── DTOs:
│   ├── CreateOrganizationDto (camelCase, for POST)
│   ├── UpdateOrganizationDto (camelCase, for PUT/PATCH)
│   ├── OrganizationResponseDto (camelCase, basic response)
│   └── OrganizationExpandedResponseDto (camelCase, with relations)
├── Model: Organization (camelCase, Date objects, computed fields)
├── Converters:
│   ├── validateCNPJ()
│   ├── formatCNPJ()
│   ├── formatPhone()
│   ├── cleanNumericString()
│   ├── toOrganizationResponseDto(entity → dto)
│   ├── toOrganizationExpandedResponseDto(entity → dto)
│   ├── toOrganizationModel(dto → model)
│   ├── toOrganizationExpandedModel(dto → model)
│   ├── toOrganizationEntityForCreate(dto → entity)
│   └── toOrganizationEntityForUpdate(dto → entity)
├── Backend Service: OrganizationBackendService
│   ├── listByUserId() → OrganizationResponseDto[]
│   ├── getByIdExpanded() → OrganizationExpandedResponseDto
│   ├── createOrganization() → OrganizationResponseDto
│   └── updateOrganization() → OrganizationResponseDto
├── API Routes:
│   ├── GET /api/organization → OrganizationResponseDto[]
│   ├── POST /api/organization → OrganizationResponseDto
│   ├── GET /api/organization/expanded/[id] → OrganizationExpandedResponseDto
│   └── PUT /api/organization/expanded/[id] → OrganizationExpandedResponseDto
├── Frontend Service: OrganizationService
│   ├── getOrganizations() → Organization[]
│   ├── getOrganizationByIdExpanded() → Organization
│   ├── createOrganization() → Organization
│   ├── updateOrganizationExpanded() → Organization
│   ├── validarCNPJ() → boolean
│   ├── formatarCNPJ() → string
│   └── formatarTelefone() → string
└── Hook: useOrganizations (React Query)
    ├── useOrganizations() → { data: Organization[], ... }
    ├── useOrganization(id) → { data: Organization, ... }
    ├── useCreateOrganization() → { mutate, ... }
    └── useUpdateOrganization() → { mutate, ... }
```
