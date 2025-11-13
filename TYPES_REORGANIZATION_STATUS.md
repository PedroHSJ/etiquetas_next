# Type System Reorganization - Implementation Guide

## Overview

This document outlines the reorganization of the TypeScript type system to separate concerns between database entities, API DTOs, and frontend models.

## Current Status

✅ Created directory structure
✅ Created database entity types (matching Supabase schema)
✅ Started creating DTO types for organizations

## Directory Structure

```
src/types/
├── database/              # Database entities (snake_case, matches Supabase)
│   ├── organization.ts    # ✅ Created
│   ├── location.ts        # ✅ Created
│   ├── product.ts         # ✅ Created
│   ├── profile.ts         # ✅ Created
│   └── index.ts           # ✅ Created
│
├── dto/                   # API DTOs (camelCase)
│   ├── organization/
│   │   ├── request.ts     # ✅ Created
│   │   ├── response.ts    # ✅ Created
│   │   └── index.ts       # ✅ Created
│   ├── product/           # ⏳ TODO
│   ├── location/          # ⏳ TODO
│   ├── label/             # ⏳ TODO
│   └── index.ts           # ⏳ TODO
│
├── models/                # Frontend models (⏳ TODO)
├── enums/                 # Shared enums (⏳ TODO)
├── common/                # Common utilities (⏳ TODO)
└── index.ts               # Main exports (⏳ TODO)
```

## Key Principles

### 1. Database Entities (`/database`)

- Match Supabase schema exactly
- Use snake_case for field names
- Represent raw database structure
- No computed fields or transformations

**Example:**

```typescript
export interface OrganizationEntity {
  id: string;
  name: string;
  main_phone: string | null; // snake_case
  created_at: string; // string (not Date)
}
```

### 2. DTOs (`/dto`)

- API request/response shapes
- Use camelCase for field names
- Separate request and response types
- Include validation-ready structures

**Example:**

```typescript
// Request
export interface CreateOrganizationDto {
  name: string;
  mainPhone?: string; // camelCase
}

// Response
export interface OrganizationResponseDto {
  id: string;
  name: string;
  mainPhone: string | null;
  createdAt: string;
}
```

### 3. Models (`/models`)

- Frontend-specific types
- Can include computed fields
- Use Date objects instead of strings
- Include UI-specific properties

**Example:**

```typescript
export interface Organization {
  id: string;
  name: string;
  mainPhone: string | null;
  createdAt: Date; // Date object
  formattedPhone?: string; // computed
}
```

## Migration Strategy

### Phase 1: Complete Type Definitions (Current)

1. ✅ Create database entity types
2. ⏳ Create all DTO types (organization, product, location, label, profile)
3. ⏳ Create enum types
4. ⏳ Create common utility types
5. ⏳ Create model types

### Phase 2: Service Layer Updates

1. Update backend services to use database entities
2. Update API routes to use DTOs
3. Add conversion utilities (snake_case ↔ camelCase)
4. Update existing convertKeysToCamel usage

### Phase 3: Frontend Updates

1. Update hooks to use DTOs
2. Update components to use models
3. Add transformation utilities (DTO → Model)
4. Update existing imports

### Phase 4: Cleanup

1. Remove old type files
2. Update all imports
3. Run type checker
4. Test all endpoints

## Next Steps (Immediate)

1. **Complete DTO types** for:

   - Product (request/response)
   - Location (request/response)
   - Label (request/response)
   - Profile (request/response)

2. **Create enum types**:

   - OrganizationType
   - ResponsibleType
   - LabelStatus
   - etc.

3. **Create common types**:

   - Pagination
   - API responses
   - Error types

4. **Create model types**:
   - Frontend-specific organization model
   - Product model
   - etc.

## Breaking Changes

⚠️ This reorganization will require updates to:

- All service files
- All API routes
- All hooks
- All components using these types

## Recommendation

Before proceeding with full migration, we should:

1. Complete all type definitions
2. Create a migration script/tool
3. Update one module completely (e.g., organizations)
4. Test thoroughly
5. Apply to remaining modules

Would you like me to:

- A) Continue creating all DTO types
- B) Create conversion utilities first
- C) Start migrating one module completely
- D) Something else?
