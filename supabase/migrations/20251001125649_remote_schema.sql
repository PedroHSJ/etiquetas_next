

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;


COMMENT ON SCHEMA "public" IS 'standard public schema';



CREATE EXTENSION IF NOT EXISTS "pg_graphql" WITH SCHEMA "graphql";






CREATE EXTENSION IF NOT EXISTS "pg_stat_statements" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "pgcrypto" WITH SCHEMA "extensions";






CREATE EXTENSION IF NOT EXISTS "supabase_vault" WITH SCHEMA "vault";






CREATE EXTENSION IF NOT EXISTS "uuid-ossp" WITH SCHEMA "extensions";






CREATE TYPE "public"."label_type" AS ENUM (
    'manipulado',
    'descongelo',
    'amostra',
    'produto_aberto'
);


ALTER TYPE "public"."label_type" OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying DEFAULT NULL::character varying, "p_cep" character varying DEFAULT NULL::character varying, "p_latitude" numeric DEFAULT NULL::numeric, "p_longitude" numeric DEFAULT NULL::numeric) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
    v_estado_id INTEGER;
    v_municipio_id INTEGER;
    v_result JSON;
BEGIN
    -- Buscar o estado
    SELECT id INTO v_estado_id
    FROM public.estados
    WHERE codigo = p_uf;
    
    IF v_estado_id IS NULL THEN
        RAISE EXCEPTION 'Estado não encontrado: %', p_uf;
    END IF;
    
    -- Verificar se o município já existe
    SELECT id INTO v_municipio_id
    FROM public.municipios
    WHERE estado_id = v_estado_id 
    AND nome = p_nome;
    
    -- Se não existe, criar
    IF v_municipio_id IS NULL THEN
        INSERT INTO public.municipios (
            estado_id, 
            nome, 
            codigo_ibge, 
            cep_inicial,
            latitude,
            longitude
        )
        VALUES (
            v_estado_id, 
            p_nome, 
            p_codigo_ibge, 
            p_cep,
            p_latitude,
            p_longitude
        )
        RETURNING id INTO v_municipio_id;
    ELSE
        -- Atualizar dados se necessário
        UPDATE public.municipios 
        SET 
            codigo_ibge = COALESCE(p_codigo_ibge, codigo_ibge),
            cep_inicial = COALESCE(p_cep, cep_inicial),
            latitude = COALESCE(p_latitude, latitude),
            longitude = COALESCE(p_longitude, longitude),
            updated_at = NOW()
        WHERE id = v_municipio_id;
    END IF;
    
    -- Retornar dados completos do município com estado
    SELECT json_build_object(
        'id', m.id,
        'nome', m.nome,
        'estado', json_build_object(
            'id', e.id,
            'codigo', e.codigo,
            'nome', e.nome
        )
    )
    INTO v_result
    FROM public.municipios m
    JOIN public.estados e ON e.id = m.estado_id
    WHERE m.id = v_municipio_id;
    
    RETURN v_result;
END;
$$;


ALTER FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) OWNER TO "postgres";


COMMENT ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) IS 'Função para buscar município existente ou criar novo com dados do ViaCEP - retorna JSON com dados completos';



CREATE OR REPLACE FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  users_data JSON;
BEGIN
  -- Buscar dados de múltiplos usuários na auth.users
  SELECT json_agg(
    json_build_object(
      'id', au.id,
      'email', au.email,
      'nome', COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name', 
        split_part(au.email, '@', 1),
        'Usuário'
      )
    )
  ) INTO users_data
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
  
  RETURN COALESCE(users_data, '[]'::JSON);
END;
$$;


ALTER FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_data_json"("user_id" "uuid") RETURNS json
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
DECLARE
  user_data JSON;
BEGIN
  -- Buscar dados básicos do usuário na auth.users
  SELECT json_build_object(
    'id', au.id,
    'email', au.email,
    'nome', COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name', 
      split_part(au.email, '@', 1),
      'Usuário'
    )
  ) INTO user_data
  FROM auth.users au
  WHERE au.id = user_id;
  
  RETURN COALESCE(user_data, '{"nome": "Usuário", "email": ""}'::JSON);
END;
$$;


ALTER FUNCTION "public"."get_user_data_json"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."get_user_info"("user_id" "uuid") RETURNS TABLE("id" "uuid", "email" character varying, "name" "text", "picture" "text", "avatar_url" "text")
    LANGUAGE "plpgsql" SECURITY DEFINER
    AS $$
BEGIN
  RETURN QUERY
  SELECT 
    u.id,
    u.email,
    COALESCE(
      u.raw_user_meta_data->>'name',
      u.raw_user_meta_data->>'full_name',
      split_part(u.email, '@', 1)
    ) as name,
    COALESCE(
      u.raw_user_meta_data->>'picture',
      u.raw_user_meta_data->>'avatar_url'
    ) as picture,
    COALESCE(
      u.raw_user_meta_data->>'avatar_url',
      u.raw_user_meta_data->>'picture'
    ) as avatar_url
  FROM auth.users u
  WHERE u.id = user_id;
END;
$$;


ALTER FUNCTION "public"."get_user_info"("user_id" "uuid") OWNER TO "postgres";


CREATE OR REPLACE FUNCTION "public"."update_updated_at_column"() RETURNS "trigger"
    LANGUAGE "plpgsql"
    AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;


ALTER FUNCTION "public"."update_updated_at_column"() OWNER TO "postgres";

SET default_tablespace = '';

SET default_table_access_method = "heap";


CREATE TABLE IF NOT EXISTS "public"."convites" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "email" character varying(255) NOT NULL,
    "organizacao_id" "uuid" NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "status" character varying(50) DEFAULT 'pendente'::character varying,
    "token_invite" character varying(255) NOT NULL,
    "expira_em" timestamp with time zone DEFAULT ("now"() + '7 days'::interval),
    "convidado_por" "uuid" NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "aceito_em" timestamp with time zone,
    "aceito_por" "uuid",
    "rejeitado_em" timestamp with time zone,
    "rejeitado_por" "uuid"
);


ALTER TABLE "public"."convites" OWNER TO "postgres";


COMMENT ON TABLE "public"."convites" IS 'Convites para novos usuários';



CREATE TABLE IF NOT EXISTS "public"."departamentos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(255) NOT NULL,
    "organizacao_id" "uuid" NOT NULL,
    "tipo_departamento" character varying(100),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."departamentos" OWNER TO "postgres";


COMMENT ON TABLE "public"."departamentos" IS 'Departamentos dentro de cada organização';



CREATE TABLE IF NOT EXISTS "public"."estados" (
    "id" integer NOT NULL,
    "codigo" character varying(2) NOT NULL,
    "nome" character varying(100) NOT NULL,
    "regiao" character varying(50) NOT NULL,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."estados" OWNER TO "postgres";


COMMENT ON TABLE "public"."estados" IS 'Estados brasileiros (UF) - Tabela pública sem RLS';



COMMENT ON COLUMN "public"."estados"."codigo" IS 'Código UF de 2 caracteres (SP, RJ, MG, etc.)';



COMMENT ON COLUMN "public"."estados"."regiao" IS 'Região geográfica (Norte, Nordeste, Centro-Oeste, Sudeste, Sul)';



CREATE SEQUENCE IF NOT EXISTS "public"."estados_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."estados_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."estados_id_seq" OWNED BY "public"."estados"."id";



CREATE SEQUENCE IF NOT EXISTS "public"."etiquetas_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."etiquetas_id_seq" OWNER TO "postgres";


CREATE TABLE IF NOT EXISTS "public"."etiquetas" (
    "id" integer DEFAULT "nextval"('"public"."etiquetas_id_seq"'::"regclass") NOT NULL,
    "product_id" integer,
    "quantidade" integer DEFAULT 1,
    "data_impressao" timestamp with time zone DEFAULT "now"(),
    "user_id" "uuid",
    "organizacao_id" "uuid",
    "status" character varying(100) DEFAULT 'impresso'::character varying,
    "observacoes" "text",
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."etiquetas" OWNER TO "postgres";


COMMENT ON TABLE "public"."etiquetas" IS 'Etiquetas geradas pelo sistema';



CREATE TABLE IF NOT EXISTS "public"."funcionalidades" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text",
    "rota" character varying(255),
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."funcionalidades" OWNER TO "postgres";


COMMENT ON TABLE "public"."funcionalidades" IS 'Funcionalidades disponíveis no sistema';



CREATE TABLE IF NOT EXISTS "public"."groups" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "description" "text"
);


ALTER TABLE "public"."groups" OWNER TO "postgres";


COMMENT ON TABLE "public"."groups" IS 'Product classification groups';



CREATE TABLE IF NOT EXISTS "public"."horarios_funcionamento" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizacao_id" "uuid" NOT NULL,
    "dia_semana" integer NOT NULL,
    "tipo_refeicao" character varying(50) NOT NULL,
    "horario_inicio" time without time zone NOT NULL,
    "horario_fim" time without time zone NOT NULL,
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "horarios_funcionamento_dia_semana_check" CHECK ((("dia_semana" >= 0) AND ("dia_semana" <= 6))),
    CONSTRAINT "horarios_funcionamento_tipo_refeicao_check" CHECK ((("tipo_refeicao")::"text" = ANY ((ARRAY['cafe'::character varying, 'almoco'::character varying, 'jantar'::character varying, 'lanche_manha'::character varying, 'lanche_tarde'::character varying, 'ceia'::character varying])::"text"[])))
);


ALTER TABLE "public"."horarios_funcionamento" OWNER TO "postgres";


COMMENT ON TABLE "public"."horarios_funcionamento" IS 'Horários de funcionamento detalhados por tipo de refeição';



COMMENT ON COLUMN "public"."horarios_funcionamento"."dia_semana" IS '0=domingo, 1=segunda-feira, ..., 6=sábado';



COMMENT ON COLUMN "public"."horarios_funcionamento"."tipo_refeicao" IS 'Tipo: cafe, almoco, jantar, lanche_manha, lanche_tarde, ceia';



CREATE TABLE IF NOT EXISTS "public"."municipios" (
    "id" integer NOT NULL,
    "estado_id" integer NOT NULL,
    "codigo_ibge" character varying(10),
    "nome" character varying(150) NOT NULL,
    "cep_inicial" character varying(8),
    "cep_final" character varying(8),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."municipios" OWNER TO "postgres";


COMMENT ON TABLE "public"."municipios" IS 'Municípios brasileiros - Tabela pública sem RLS';



COMMENT ON COLUMN "public"."municipios"."codigo_ibge" IS 'Código IBGE do município quando disponível';



COMMENT ON COLUMN "public"."municipios"."cep_inicial" IS 'CEP inicial da faixa do município (sem hífen)';



COMMENT ON COLUMN "public"."municipios"."cep_final" IS 'CEP final da faixa do município (sem hífen)';



CREATE SEQUENCE IF NOT EXISTS "public"."municipios_id_seq"
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE "public"."municipios_id_seq" OWNER TO "postgres";


ALTER SEQUENCE "public"."municipios_id_seq" OWNED BY "public"."municipios"."id";



CREATE TABLE IF NOT EXISTS "public"."organizacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(255) NOT NULL,
    "tipo" character varying(100),
    "user_id" "uuid",
    "created_at" timestamp with time zone DEFAULT "now"(),
    "cnpj" character varying(14),
    "tipo_uan" character varying(50),
    "capacidade_atendimento" integer,
    "data_inauguracao" "date",
    "endereco_completo" "text",
    "cep" character varying(9),
    "bairro" character varying(100),
    "latitude" numeric(10,8),
    "longitude" numeric(11,8),
    "telefone_principal" character varying(15),
    "telefone_alternativo" character varying(15),
    "email_institucional" character varying(255),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    "estado_id" integer,
    "municipio_id" integer,
    "endereco" character varying(255),
    "numero" character varying(20),
    "complemento" character varying(100),
    CONSTRAINT "organizacoes_tipo_uan_check" CHECK ((("tipo_uan")::"text" = ANY ((ARRAY['restaurante_comercial'::character varying, 'restaurante_institucional'::character varying, 'lanchonete'::character varying, 'padaria'::character varying, 'cozinha_industrial'::character varying, 'catering'::character varying, 'outro'::character varying])::"text"[])))
);


ALTER TABLE "public"."organizacoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."organizacoes" IS 'Tabela de organizações/empresas que usam o sistema';



COMMENT ON COLUMN "public"."organizacoes"."cnpj" IS 'CNPJ da organização (apenas números)';



COMMENT ON COLUMN "public"."organizacoes"."tipo_uan" IS 'Tipo da UAN: restaurante_comercial, restaurante_institucional, lanchonete, padaria, cozinha_industrial, catering, outro';



COMMENT ON COLUMN "public"."organizacoes"."capacidade_atendimento" IS 'Número de refeições servidas por dia';



COMMENT ON COLUMN "public"."organizacoes"."latitude" IS 'Coordenada de latitude para localização GPS';



COMMENT ON COLUMN "public"."organizacoes"."longitude" IS 'Coordenada de longitude para localização GPS';



COMMENT ON COLUMN "public"."organizacoes"."estado_id" IS 'Referência para o estado (FK para estados.id)';



COMMENT ON COLUMN "public"."organizacoes"."municipio_id" IS 'Referência para o município (FK para municipios.id)';



COMMENT ON COLUMN "public"."organizacoes"."endereco" IS 'Logradouro (rua, avenida) da organização';



COMMENT ON COLUMN "public"."organizacoes"."numero" IS 'Número do endereço da organização';



COMMENT ON COLUMN "public"."organizacoes"."complemento" IS 'Complemento do endereço (apto, sala, etc.)';



CREATE TABLE IF NOT EXISTS "public"."perfis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "nome" character varying(255) NOT NULL,
    "descricao" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."perfis" OWNER TO "postgres";


COMMENT ON TABLE "public"."perfis" IS 'Perfis de acesso dos usuários';



CREATE TABLE IF NOT EXISTS "public"."permissoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "funcionalidade_id" "uuid" NOT NULL,
    "perfil_usuario_id" "uuid" NOT NULL,
    "acao" character varying(100),
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."permissoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."permissoes" IS 'Permissões de acesso por perfil';



CREATE TABLE IF NOT EXISTS "public"."products" (
    "id" integer NOT NULL,
    "name" "text" NOT NULL,
    "group_id" integer
);


ALTER TABLE "public"."products" OWNER TO "postgres";


COMMENT ON TABLE "public"."products" IS 'Products registered in the system';



CREATE TABLE IF NOT EXISTS "public"."responsaveis_tecnicos" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "organizacao_id" "uuid" NOT NULL,
    "tipo_responsavel" character varying(50) NOT NULL,
    "nome" character varying(255) NOT NULL,
    "documento" character varying(20),
    "telefone" character varying(15),
    "email" character varying(255),
    "observacoes" "text",
    "ativo" boolean DEFAULT true,
    "created_at" timestamp with time zone DEFAULT "now"(),
    "updated_at" timestamp with time zone DEFAULT "now"(),
    CONSTRAINT "responsaveis_tecnicos_tipo_responsavel_check" CHECK ((("tipo_responsavel")::"text" = ANY ((ARRAY['nutricionista'::character varying, 'gestor'::character varying, 'seguranca_alimentar'::character varying, 'outro'::character varying])::"text"[])))
);


ALTER TABLE "public"."responsaveis_tecnicos" OWNER TO "postgres";


COMMENT ON TABLE "public"."responsaveis_tecnicos" IS 'Responsáveis técnicos das UANs (nutricionistas, gestores, etc.)';



COMMENT ON COLUMN "public"."responsaveis_tecnicos"."tipo_responsavel" IS 'Tipo: nutricionista, gestor, seguranca_alimentar, outro';



COMMENT ON COLUMN "public"."responsaveis_tecnicos"."documento" IS 'Documento profissional (CRN, CPF, etc.)';



CREATE TABLE IF NOT EXISTS "public"."usuarios_organizacoes" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_id" "uuid" NOT NULL,
    "organizacao_id" "uuid" NOT NULL,
    "perfil_id" "uuid" NOT NULL,
    "ativo" boolean DEFAULT true,
    "data_entrada" timestamp with time zone DEFAULT "now"(),
    "data_saida" timestamp with time zone,
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usuarios_organizacoes" OWNER TO "postgres";


COMMENT ON TABLE "public"."usuarios_organizacoes" IS 'Relacionamento entre usuários e organizações';



CREATE TABLE IF NOT EXISTS "public"."usuarios_perfis" (
    "id" "uuid" DEFAULT "gen_random_uuid"() NOT NULL,
    "usuario_organizacao_id" "uuid" NOT NULL,
    "perfil_usuario_id" "uuid" NOT NULL,
    "ativo" boolean DEFAULT true,
    "data_inicio" timestamp with time zone DEFAULT "now"(),
    "created_at" timestamp with time zone DEFAULT "now"()
);


ALTER TABLE "public"."usuarios_perfis" OWNER TO "postgres";


COMMENT ON TABLE "public"."usuarios_perfis" IS 'Relacionamento entre usuários e perfis';



ALTER TABLE ONLY "public"."estados" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."estados_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."municipios" ALTER COLUMN "id" SET DEFAULT "nextval"('"public"."municipios_id_seq"'::"regclass");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_token_invite_key" UNIQUE ("token_invite");



ALTER TABLE ONLY "public"."departamentos"
    ADD CONSTRAINT "departamentos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."estados"
    ADD CONSTRAINT "estados_codigo_key" UNIQUE ("codigo");



ALTER TABLE ONLY "public"."estados"
    ADD CONSTRAINT "estados_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."etiquetas"
    ADD CONSTRAINT "etiquetas_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."funcionalidades"
    ADD CONSTRAINT "funcionalidades_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."funcionalidades"
    ADD CONSTRAINT "funcionalidades_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_name_key" UNIQUE ("name");



ALTER TABLE ONLY "public"."groups"
    ADD CONSTRAINT "groups_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."horarios_funcionamento"
    ADD CONSTRAINT "horarios_funcionamento_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."municipios"
    ADD CONSTRAINT "municipios_codigo_ibge_key" UNIQUE ("codigo_ibge");



ALTER TABLE ONLY "public"."municipios"
    ADD CONSTRAINT "municipios_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."organizacoes"
    ADD CONSTRAINT "organizacoes_cnpj_key" UNIQUE ("cnpj");



ALTER TABLE ONLY "public"."organizacoes"
    ADD CONSTRAINT "organizacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."perfis"
    ADD CONSTRAINT "perfis_usuario_nome_key" UNIQUE ("nome");



ALTER TABLE ONLY "public"."perfis"
    ADD CONSTRAINT "perfis_usuario_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."responsaveis_tecnicos"
    ADD CONSTRAINT "responsaveis_tecnicos_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios_organizacoes"
    ADD CONSTRAINT "usuarios_organizacoes_pkey" PRIMARY KEY ("id");



ALTER TABLE ONLY "public"."usuarios_perfis"
    ADD CONSTRAINT "usuarios_perfis_pkey" PRIMARY KEY ("id");



CREATE INDEX "idx_convites_email" ON "public"."convites" USING "btree" ("email");



CREATE INDEX "idx_convites_status" ON "public"."convites" USING "btree" ("status");



CREATE INDEX "idx_convites_token" ON "public"."convites" USING "btree" ("token_invite");



CREATE INDEX "idx_estados_codigo" ON "public"."estados" USING "btree" ("codigo");



CREATE INDEX "idx_etiquetas_data_impressao" ON "public"."etiquetas" USING "btree" ("data_impressao");



CREATE INDEX "idx_etiquetas_organizacao" ON "public"."etiquetas" USING "btree" ("organizacao_id");



CREATE INDEX "idx_etiquetas_product" ON "public"."etiquetas" USING "btree" ("product_id");



CREATE INDEX "idx_etiquetas_user" ON "public"."etiquetas" USING "btree" ("user_id");



CREATE INDEX "idx_horarios_ativo" ON "public"."horarios_funcionamento" USING "btree" ("ativo");



CREATE INDEX "idx_horarios_dia" ON "public"."horarios_funcionamento" USING "btree" ("dia_semana");



CREATE INDEX "idx_horarios_organizacao" ON "public"."horarios_funcionamento" USING "btree" ("organizacao_id");



CREATE INDEX "idx_horarios_tipo_refeicao" ON "public"."horarios_funcionamento" USING "btree" ("tipo_refeicao");



CREATE INDEX "idx_municipios_codigo_ibge" ON "public"."municipios" USING "btree" ("codigo_ibge");



CREATE INDEX "idx_municipios_estado" ON "public"."municipios" USING "btree" ("estado_id");



CREATE INDEX "idx_municipios_nome" ON "public"."municipios" USING "btree" ("nome");



CREATE INDEX "idx_organizacoes_cnpj" ON "public"."organizacoes" USING "btree" ("cnpj");



CREATE INDEX "idx_organizacoes_estado_id" ON "public"."organizacoes" USING "btree" ("estado_id");



CREATE INDEX "idx_organizacoes_municipio_id" ON "public"."organizacoes" USING "btree" ("municipio_id");



CREATE INDEX "idx_organizacoes_tipo_uan" ON "public"."organizacoes" USING "btree" ("tipo_uan");



CREATE INDEX "idx_products_group" ON "public"."products" USING "btree" ("group_id");



CREATE INDEX "idx_products_name" ON "public"."products" USING "btree" ("name");



CREATE INDEX "idx_responsaveis_ativo" ON "public"."responsaveis_tecnicos" USING "btree" ("ativo");



CREATE INDEX "idx_responsaveis_organizacao" ON "public"."responsaveis_tecnicos" USING "btree" ("organizacao_id");



CREATE INDEX "idx_responsaveis_tipo" ON "public"."responsaveis_tecnicos" USING "btree" ("tipo_responsavel");



CREATE INDEX "idx_usuarios_organizacoes_organizacao" ON "public"."usuarios_organizacoes" USING "btree" ("organizacao_id");



CREATE INDEX "idx_usuarios_organizacoes_usuario" ON "public"."usuarios_organizacoes" USING "btree" ("usuario_id");



CREATE OR REPLACE TRIGGER "update_horarios_funcionamento_updated_at" BEFORE UPDATE ON "public"."horarios_funcionamento" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_municipios_updated_at" BEFORE UPDATE ON "public"."municipios" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_organizacoes_updated_at" BEFORE UPDATE ON "public"."organizacoes" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



CREATE OR REPLACE TRIGGER "update_responsaveis_tecnicos_updated_at" BEFORE UPDATE ON "public"."responsaveis_tecnicos" FOR EACH ROW EXECUTE FUNCTION "public"."update_updated_at_column"();



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_aceito_por_fkey" FOREIGN KEY ("aceito_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_convidado_por_fkey" FOREIGN KEY ("convidado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "public"."organizacoes"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."convites"
    ADD CONSTRAINT "convites_rejeitado_por_fkey" FOREIGN KEY ("rejeitado_por") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."departamentos"
    ADD CONSTRAINT "departamentos_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "public"."organizacoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."etiquetas"
    ADD CONSTRAINT "etiquetas_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "public"."organizacoes"("id");



ALTER TABLE ONLY "public"."etiquetas"
    ADD CONSTRAINT "etiquetas_product_id_fkey" FOREIGN KEY ("product_id") REFERENCES "public"."products"("id");



ALTER TABLE ONLY "public"."etiquetas"
    ADD CONSTRAINT "etiquetas_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."horarios_funcionamento"
    ADD CONSTRAINT "horarios_funcionamento_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "public"."organizacoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."municipios"
    ADD CONSTRAINT "municipios_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."estados"("id");



ALTER TABLE ONLY "public"."organizacoes"
    ADD CONSTRAINT "organizacoes_estado_id_fkey" FOREIGN KEY ("estado_id") REFERENCES "public"."estados"("id");



ALTER TABLE ONLY "public"."organizacoes"
    ADD CONSTRAINT "organizacoes_municipio_id_fkey" FOREIGN KEY ("municipio_id") REFERENCES "public"."municipios"("id");



ALTER TABLE ONLY "public"."organizacoes"
    ADD CONSTRAINT "organizacoes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_funcionalidade_id_fkey" FOREIGN KEY ("funcionalidade_id") REFERENCES "public"."funcionalidades"("id");



ALTER TABLE ONLY "public"."permissoes"
    ADD CONSTRAINT "permissoes_perfil_usuario_id_fkey" FOREIGN KEY ("perfil_usuario_id") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."products"
    ADD CONSTRAINT "products_group_id_fkey" FOREIGN KEY ("group_id") REFERENCES "public"."groups"("id");



ALTER TABLE ONLY "public"."responsaveis_tecnicos"
    ADD CONSTRAINT "responsaveis_tecnicos_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "public"."organizacoes"("id") ON DELETE CASCADE;



ALTER TABLE ONLY "public"."usuarios_organizacoes"
    ADD CONSTRAINT "usuarios_organizacoes_organizacao_id_fkey" FOREIGN KEY ("organizacao_id") REFERENCES "public"."organizacoes"("id");



ALTER TABLE ONLY "public"."usuarios_organizacoes"
    ADD CONSTRAINT "usuarios_organizacoes_perfil_id_fkey" FOREIGN KEY ("perfil_id") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."usuarios_organizacoes"
    ADD CONSTRAINT "usuarios_organizacoes_usuario_id_fkey" FOREIGN KEY ("usuario_id") REFERENCES "auth"."users"("id");



ALTER TABLE ONLY "public"."usuarios_perfis"
    ADD CONSTRAINT "usuarios_perfis_perfil_usuario_id_fkey" FOREIGN KEY ("perfil_usuario_id") REFERENCES "public"."perfis"("id");



ALTER TABLE ONLY "public"."usuarios_perfis"
    ADD CONSTRAINT "usuarios_perfis_usuario_organizacao_id_fkey" FOREIGN KEY ("usuario_organizacao_id") REFERENCES "public"."usuarios_organizacoes"("id");



CREATE POLICY "Usuários podem atualizar horários de suas organizações" ON "public"."horarios_funcionamento" FOR UPDATE USING (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem atualizar responsáveis de suas organizações" ON "public"."responsaveis_tecnicos" FOR UPDATE USING (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem deletar horários de suas organizações" ON "public"."horarios_funcionamento" FOR DELETE USING (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem deletar responsáveis de suas organizações" ON "public"."responsaveis_tecnicos" FOR DELETE USING (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem inserir horários em suas organizações" ON "public"."horarios_funcionamento" FOR INSERT WITH CHECK (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem inserir responsáveis em suas organizações" ON "public"."responsaveis_tecnicos" FOR INSERT WITH CHECK (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem ver horários de suas organizações" ON "public"."horarios_funcionamento" FOR SELECT USING (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



CREATE POLICY "Usuários podem ver responsáveis de suas organizações" ON "public"."responsaveis_tecnicos" FOR SELECT USING (("organizacao_id" IN ( SELECT "usuarios_organizacoes"."organizacao_id"
   FROM "public"."usuarios_organizacoes"
  WHERE (("usuarios_organizacoes"."usuario_id" = "auth"."uid"()) AND ("usuarios_organizacoes"."ativo" = true)))));



ALTER TABLE "public"."horarios_funcionamento" ENABLE ROW LEVEL SECURITY;


ALTER TABLE "public"."responsaveis_tecnicos" ENABLE ROW LEVEL SECURITY;




ALTER PUBLICATION "supabase_realtime" OWNER TO "postgres";






GRANT USAGE ON SCHEMA "public" TO "postgres";
GRANT USAGE ON SCHEMA "public" TO "anon";
GRANT USAGE ON SCHEMA "public" TO "authenticated";
GRANT USAGE ON SCHEMA "public" TO "service_role";

























































































































































GRANT ALL ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) TO "anon";
GRANT ALL ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) TO "authenticated";
GRANT ALL ON FUNCTION "public"."buscar_ou_criar_municipio"("p_nome" character varying, "p_uf" character varying, "p_codigo_ibge" character varying, "p_cep" character varying, "p_latitude" numeric, "p_longitude" numeric) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) TO "anon";
GRANT ALL ON FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_multiple_users_data"("user_ids" "uuid"[]) TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_data_json"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_data_json"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_data_json"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."get_user_info"("user_id" "uuid") TO "anon";
GRANT ALL ON FUNCTION "public"."get_user_info"("user_id" "uuid") TO "authenticated";
GRANT ALL ON FUNCTION "public"."get_user_info"("user_id" "uuid") TO "service_role";



GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "anon";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "authenticated";
GRANT ALL ON FUNCTION "public"."update_updated_at_column"() TO "service_role";


















GRANT ALL ON TABLE "public"."convites" TO "anon";
GRANT ALL ON TABLE "public"."convites" TO "authenticated";
GRANT ALL ON TABLE "public"."convites" TO "service_role";



GRANT ALL ON TABLE "public"."departamentos" TO "anon";
GRANT ALL ON TABLE "public"."departamentos" TO "authenticated";
GRANT ALL ON TABLE "public"."departamentos" TO "service_role";



GRANT ALL ON TABLE "public"."estados" TO "anon";
GRANT ALL ON TABLE "public"."estados" TO "authenticated";
GRANT ALL ON TABLE "public"."estados" TO "service_role";



GRANT ALL ON SEQUENCE "public"."estados_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."estados_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."estados_id_seq" TO "service_role";



GRANT ALL ON SEQUENCE "public"."etiquetas_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."etiquetas_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."etiquetas_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."etiquetas" TO "anon";
GRANT ALL ON TABLE "public"."etiquetas" TO "authenticated";
GRANT ALL ON TABLE "public"."etiquetas" TO "service_role";



GRANT ALL ON TABLE "public"."funcionalidades" TO "anon";
GRANT ALL ON TABLE "public"."funcionalidades" TO "authenticated";
GRANT ALL ON TABLE "public"."funcionalidades" TO "service_role";



GRANT ALL ON TABLE "public"."groups" TO "anon";
GRANT ALL ON TABLE "public"."groups" TO "authenticated";
GRANT ALL ON TABLE "public"."groups" TO "service_role";



GRANT ALL ON TABLE "public"."horarios_funcionamento" TO "anon";
GRANT ALL ON TABLE "public"."horarios_funcionamento" TO "authenticated";
GRANT ALL ON TABLE "public"."horarios_funcionamento" TO "service_role";



GRANT ALL ON TABLE "public"."municipios" TO "anon";
GRANT ALL ON TABLE "public"."municipios" TO "authenticated";
GRANT ALL ON TABLE "public"."municipios" TO "service_role";



GRANT ALL ON SEQUENCE "public"."municipios_id_seq" TO "anon";
GRANT ALL ON SEQUENCE "public"."municipios_id_seq" TO "authenticated";
GRANT ALL ON SEQUENCE "public"."municipios_id_seq" TO "service_role";



GRANT ALL ON TABLE "public"."organizacoes" TO "anon";
GRANT ALL ON TABLE "public"."organizacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."organizacoes" TO "service_role";



GRANT ALL ON TABLE "public"."perfis" TO "anon";
GRANT ALL ON TABLE "public"."perfis" TO "authenticated";
GRANT ALL ON TABLE "public"."perfis" TO "service_role";



GRANT ALL ON TABLE "public"."permissoes" TO "anon";
GRANT ALL ON TABLE "public"."permissoes" TO "authenticated";
GRANT ALL ON TABLE "public"."permissoes" TO "service_role";



GRANT ALL ON TABLE "public"."products" TO "anon";
GRANT ALL ON TABLE "public"."products" TO "authenticated";
GRANT ALL ON TABLE "public"."products" TO "service_role";



GRANT ALL ON TABLE "public"."responsaveis_tecnicos" TO "anon";
GRANT ALL ON TABLE "public"."responsaveis_tecnicos" TO "authenticated";
GRANT ALL ON TABLE "public"."responsaveis_tecnicos" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_organizacoes" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_organizacoes" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_organizacoes" TO "service_role";



GRANT ALL ON TABLE "public"."usuarios_perfis" TO "anon";
GRANT ALL ON TABLE "public"."usuarios_perfis" TO "authenticated";
GRANT ALL ON TABLE "public"."usuarios_perfis" TO "service_role";









ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON SEQUENCES TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON FUNCTIONS TO "service_role";






ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "postgres";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "anon";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "authenticated";
ALTER DEFAULT PRIVILEGES FOR ROLE "postgres" IN SCHEMA "public" GRANT ALL ON TABLES TO "service_role";






























RESET ALL;

