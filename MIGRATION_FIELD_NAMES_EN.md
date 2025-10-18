# Database Field Name Standardization - Migration Guide

## Overview

This document outlines the standardization of database field names from Portuguese to English across the product and stock management modules.

**Note:** Since this system hasn't been used by anyone yet, we've directly edited the existing migration files instead of creating new ones.

## Database Changes

### Tables Renamed

1. `grupos` → `groups`
2. `produtos` → `products`
3. `estoque` → `stock`
4. `estoque_movimentacoes` → `stock_movements`

### Column Names Changed

#### Groups Table

- `nome` → `name`
- `descricao` → `description`

#### Products Table

- `nome` → `name`
- `grupo_id` → `group_id`

#### Stock Table

- `quantidade_atual` → `current_quantity`
- `usuario_id` → `user_id`

#### Stock Movements Table

- `usuario_id` → `user_id`
- `tipo_movimentacao` → `movement_type`
- `quantidade` → `quantity`
- `observacao` → `observation`
- `data_movimentacao` → `movement_date`

### Indexes Updated

All indexes have been renamed to reflect English naming:

- `idx_produtos_grupo` → `idx_products_group`
- `idx_produtos_nome` → `idx_products_name`
- `idx_estoque_*` → `idx_stock_*`
- `idx_estoque_movimentacoes_*` → `idx_stock_movements_*`

### Constraints Updated

All constraints have been renamed:

- Primary keys: `grupos_pkey` → `groups_pkey`
- Foreign keys: `produtos_grupo_id_fkey` → `products_group_id_fkey`
- Check constraints: `estoque_quantidade_atual_check` → `stock_current_quantity_check`
- Unique constraints: `grupos_nome_key` → `groups_name_key`

### Triggers Updated

- `update_estoque_updated_at` → `update_stock_updated_at`
- `trigger_processar_movimentacao_estoque` → `trigger_process_stock_movement`

## TypeScript Changes

### New Type Files Created

1. `src/types/stock.ts` - English versions with backward compatibility aliases

### Updated Type Files

1. `src/types/supabase.ts` - Updated with English interfaces and deprecated old ones

### Backward Compatibility

All old Portuguese type names are available as deprecated aliases to prevent breaking changes during migration:

```typescript
/** @deprecated Use Stock instead */
export type Estoque = Stock;

/** @deprecated Use StockMovement instead */
export type EstoqueMovimentacao = StockMovement;
```

## Migration Steps

### Phase 1: Database Migration ✅

1. ✅ Updated existing migration file: `20251001125649_remote_schema.sql`
2. ✅ Updated stock migration file: `20251015132350_create_estoque_tables.sql`
3. ✅ Updated seed file: `supabase/seed.sql`
4. ⏳ Apply migrations to database (supabase db reset or supabase db push)

### Phase 2: Type System Updates ✅

1. ✅ Created new `src/types/stock.ts` with English types
2. ✅ Updated `src/types/supabase.ts` with English types
3. ⏳ Update `src/types/etiquetas.ts` references
4. ⏳ Update other type files that reference produtos/grupos

### Phase 3: Application Code Updates ⏳

Files that need to be updated:

#### API Routes

- `src/app/api/estoque/entrada-rapida/route.ts`
- Other estoque-related API routes

#### Components

- `src/components/estoque/EntradaRapidaDialog.tsx`
- `src/components/estoque/EstoqueTable.tsx`
- `src/app/(sidebar)/estoque/page.tsx`
- `src/components/ui/generic-table.tsx`

#### Services

- `src/lib/services/etiquetaService.ts`
- `src/lib/services/technicalSheetService.ts`
- `src/lib/services/productService.ts`

#### Hooks

- `src/hooks/useEtiquetas.ts`
- `src/hooks/useEstoque.ts`

#### Contexts

- `src/contexts/OrganizationContext.tsx`

### Phase 4: Seed File Updates ⏳

- `supabase/seed.sql`
- `database_consolidado.sql`
- Other seed files

### Phase 5: Remove Deprecated Types ⏳

After all code is migrated, remove deprecated type aliases:

- Remove deprecated exports from `src/types/stock.ts`
- Remove deprecated exports from `src/types/supabase.ts`

### Phase 6: Testing ⏳

1. Test all CRUD operations for products
2. Test all CRUD operations for stock
3. Test stock movements (entry/exit)
4. Test label generation with products
5. Test technical sheets with products
6. Test reporting features

## Important Notes

### Foreign Key References

The migration maintains `produto_id` as the FK column name in other tables (etiquetas, stock, etc.) to minimize breaking changes. This will be addressed in a future phase.

### Movement Types

The enum values `'ENTRADA'` and `'SAIDA'` are preserved in the database to maintain compatibility. Only the column name changed from `tipo_movimentacao` to `movement_type`.

### User Interface

All user-facing text remains in Portuguese. Only database column names and internal TypeScript types are affected.

## Rollback Plan

If issues arise, rollback can be performed by:

1. Reverting the migration file
2. Restoring the old type files from git history
3. Reverting application code changes

## Migration SQL Command

To apply the migration:

```bash
# Using Supabase CLI
supabase db push

# Or manually in SQL editor
# Copy contents of: supabase/migrations/20251016000000_standardize_field_names_to_english.sql
```

## Validation Queries

After migration, validate with these queries:

```sql
-- Verify table renames
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('groups', 'products', 'stock', 'stock_movements');

-- Verify column renames
SELECT column_name FROM information_schema.columns
WHERE table_name = 'products' AND column_name IN ('name', 'group_id');

-- Verify foreign keys
SELECT constraint_name, table_name
FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
AND table_name IN ('products', 'stock', 'stock_movements');

-- Test data integrity
SELECT p.id, p.name, g.name as group_name
FROM products p
LEFT JOIN groups g ON p.group_id = g.id
LIMIT 5;
```

## Next Steps

1. Review and approve this migration plan
2. Backup the database
3. Apply the migration to development environment
4. Update application code incrementally
5. Test thoroughly
6. Deploy to staging
7. Final validation
8. Deploy to production

## Questions or Issues?

Contact the development team if you encounter any issues during migration.
