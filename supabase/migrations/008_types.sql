-- 005_types.sql
DO $$ BEGIN
    CREATE TYPE public.label_type AS ENUM (
        'manipulado',
        'descongelo',
        'amostra',
        'produto_aberto'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;
