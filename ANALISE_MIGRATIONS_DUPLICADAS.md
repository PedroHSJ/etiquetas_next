# Relatório de Análise de Migrations - Tabelas Duplicadas

## ⚠️ TABELAS DUPLICADAS ENCONTRADAS

### 1. **user_organizations**

**Primeira Definição:** `001_core_entities.sql` (linha 40-51)

```sql
CREATE TABLE IF NOT EXISTS public.user_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    active boolean DEFAULT true,
    entry_date timestamp with time zone DEFAULT now(),
    exit_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_organizations_pkey PRIMARY KEY (id),
    CONSTRAINT user_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);
```

**Problemas:**

- ❌ Falta FK para `auth.users(id)` no campo `user_id`
- ❌ Falta FK para `profiles(id)` no campo `profile_id`

**Segunda Definição:** `007_auxiliary_tables.sql` (linha 69-82)

```sql
CREATE TABLE IF NOT EXISTS public.user_organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_id uuid NOT NULL,
    organization_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    active boolean DEFAULT true,
    entry_date timestamp with time zone DEFAULT now(),
    exit_date timestamp with time zone,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_organizations_pkey PRIMARY KEY (id),
    CONSTRAINT user_organizations_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
    CONSTRAINT user_organizations_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT user_organizations_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
```

**Status:**

- ✅ Todas as FKs estão presentes
- ✅ Definição COMPLETA

---

### 2. **user_profiles**

**Primeira Definição:** `001_core_entities.sql` (linha 54-61)

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_organization_id uuid NOT NULL,
    profile_user_id uuid NOT NULL,  ⚠️ CAMPO ERRADO!
    active boolean DEFAULT true,
    start_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id)
);
```

**Problemas:**

- ❌ Campo `profile_user_id` está **ERRADO** (deveria ser `profile_id`)
- ❌ Falta FK para `user_organizations(id)`
- ❌ Falta FK para `profiles(id)`

**Segunda Definição:** `007_auxiliary_tables.sql` (linha 85-95)

```sql
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_organization_id uuid NOT NULL,
    profile_id uuid NOT NULL,  ✅ CAMPO CORRETO!
    active boolean DEFAULT true,
    start_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_user_organization_id_fkey FOREIGN KEY (user_organization_id) REFERENCES public.user_organizations(id),
    CONSTRAINT user_profiles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
```

**Status:**

- ✅ Campo `profile_id` CORRETO
- ✅ Todas as FKs estão presentes
- ✅ Definição COMPLETA

---

## 📊 RESUMO

| Tabela               | Migration 001                         | Migration 007 | Status       |
| -------------------- | ------------------------------------- | ------------- | ------------ |
| `user_organizations` | ⚠️ Incompleta (faltam 2 FKs)          | ✅ Completa   | **Usar 007** |
| `user_profiles`      | ❌ ERRADA (campo errado + faltam FKs) | ✅ Completa   | **Usar 007** |

---

## ✅ RECOMENDAÇÃO

### Opção 1: Remover Definições do 001_core_entities.sql (**RECOMENDADO**)

**Remover as linhas 40-61** do arquivo `001_core_entities.sql`:

- Remove `CREATE TABLE user_organizations`
- Remove `CREATE TABLE user_profiles`

**Justificativa:**

- A migration `007_auxiliary_tables.sql` já cria essas tabelas CORRETAMENTE
- O arquivo `007` é focado em tabelas auxiliares (profiles, permissions, etc.)
- As definições em `007` estão completas com todas as FKs
- A definição em `001` tem erros (campo `profile_user_id` errado)

### Opção 2: Corrigir e Manter no 001 (Não Recomendado)

Correções necessárias no `001_core_entities.sql`:

1. Trocar `profile_user_id` por `profile_id`
2. Adicionar FK `user_id → auth.users(id)` em `user_organizations`
3. Adicionar FK `profile_id → profiles(id)` em `user_organizations`
4. Adicionar FK `user_organization_id → user_organizations(id)` em `user_profiles`
5. Adicionar FK `profile_id → profiles(id)` em `user_profiles`
6. Remover as definições do `007_auxiliary_tables.sql`

**Problema:** Isso causaria dependência circular, pois `profiles` é criado em `007`, mas `user_organizations` no `001` precisa referenciar `profiles`.

---

## 🎯 AÇÃO NECESSÁRIA

**REMOVER as linhas 40-61 do arquivo `supabase/migrations/001_core_entities.sql`**

Isso inclui:

- Linha 40-51: `CREATE TABLE user_organizations`
- Linha 54-61: `CREATE TABLE user_profiles`

As definições corretas já existem em `007_auxiliary_tables.sql` e serão executadas na ordem correta (após `profiles` ser criado).

---

## 🔍 OUTRAS VERIFICAÇÕES

Não foram encontradas outras duplicações de tabelas nas migrations:

- ✅ `organizations` - apenas em `001_core_entities.sql`
- ✅ `departments` - apenas em `001_core_entities.sql`
- ✅ `profiles` - apenas em `007_auxiliary_tables.sql`
- ✅ `permissions` - apenas em `007_auxiliary_tables.sql`
- ✅ `functionalities` - apenas em `007_auxiliary_tables.sql`
