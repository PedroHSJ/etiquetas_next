-- =============================================================================
-- MÓDULO DE ESTOQUE - TABELAS
-- =============================================================================

-- Tabela de Estoque (saldo atual por produto)
CREATE TABLE IF NOT EXISTS "public"."estoque" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "produto_id" integer NOT NULL,
    "quantidade_atual" numeric(10,3) DEFAULT 0 NOT NULL,
    "usuario_id" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "estoque_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "estoque_produto_id_unique" UNIQUE ("produto_id"),
    CONSTRAINT "estoque_quantidade_atual_check" CHECK ("quantidade_atual" >= 0)
);

-- Tabela de Movimentações de Estoque (histórico de entradas e saídas)
CREATE TABLE IF NOT EXISTS "public"."estoque_movimentacoes" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "produto_id" integer NOT NULL,
    "usuario_id" uuid NOT NULL,
    "tipo_movimentacao" text NOT NULL,
    "quantidade" numeric(10,3) NOT NULL,
    "observacao" text,
    "data_movimentacao" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "estoque_movimentacoes_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "estoque_movimentacoes_tipo_check" CHECK ("tipo_movimentacao" IN ('ENTRADA', 'SAIDA')),
    CONSTRAINT "estoque_movimentacoes_quantidade_check" CHECK ("quantidade" > 0)
);

-- =============================================================================
-- ÍNDICES
-- =============================================================================

CREATE INDEX IF NOT EXISTS "idx_estoque_produto_id" ON "public"."estoque" ("produto_id");
CREATE INDEX IF NOT EXISTS "idx_estoque_usuario_id" ON "public"."estoque" ("usuario_id");
CREATE INDEX IF NOT EXISTS "idx_estoque_movimentacoes_produto_id" ON "public"."estoque_movimentacoes" ("produto_id");
CREATE INDEX IF NOT EXISTS "idx_estoque_movimentacoes_usuario_id" ON "public"."estoque_movimentacoes" ("usuario_id");
CREATE INDEX IF NOT EXISTS "idx_estoque_movimentacoes_data" ON "public"."estoque_movimentacoes" ("data_movimentacao");
CREATE INDEX IF NOT EXISTS "idx_estoque_movimentacoes_tipo" ON "public"."estoque_movimentacoes" ("tipo_movimentacao");

-- =============================================================================
-- CHAVES ESTRANGEIRAS
-- =============================================================================

-- FK para produtos (assumindo que existe tabela produtos com id integer)
ALTER TABLE "public"."estoque" 
ADD CONSTRAINT "estoque_produto_id_fkey" 
FOREIGN KEY ("produto_id") REFERENCES "public"."produtos" ("id") ON DELETE CASCADE;

ALTER TABLE "public"."estoque_movimentacoes" 
ADD CONSTRAINT "estoque_movimentacoes_produto_id_fkey" 
FOREIGN KEY ("produto_id") REFERENCES "public"."produtos" ("id") ON DELETE CASCADE;

-- FK para usuários (assumindo que existe tabela de usuários auth.users)
ALTER TABLE "public"."estoque" 
ADD CONSTRAINT "estoque_usuario_id_fkey" 
FOREIGN KEY ("usuario_id") REFERENCES "auth"."users" ("id") ON DELETE RESTRICT;

ALTER TABLE "public"."estoque_movimentacoes" 
ADD CONSTRAINT "estoque_movimentacoes_usuario_id_fkey" 
FOREIGN KEY ("usuario_id") REFERENCES "auth"."users" ("id") ON DELETE RESTRICT;

-- =============================================================================
-- TRIGGERS PARA UPDATED_AT
-- =============================================================================

-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para tabela estoque
CREATE TRIGGER update_estoque_updated_at 
    BEFORE UPDATE ON "public"."estoque" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- FUNÇÃO PARA MOVIMENTAÇÃO DE ESTOQUE
-- =============================================================================

-- Função que atualiza o estoque automaticamente quando há movimentação
CREATE OR REPLACE FUNCTION processar_movimentacao_estoque()
RETURNS TRIGGER AS $$
DECLARE
    v_quantidade_atual NUMERIC;
    v_nova_quantidade NUMERIC;
BEGIN
    -- Se for INSERT (nova movimentação)
    IF TG_OP = 'INSERT' THEN
        -- Buscar quantidade atual ou criar registro se não existir
        SELECT quantidade_atual INTO v_quantidade_atual 
        FROM public.estoque 
        WHERE produto_id = NEW.produto_id;
        
        -- Se não existe registro de estoque, criar um
        IF v_quantidade_atual IS NULL THEN
            IF NEW.tipo_movimentacao = 'ENTRADA' THEN
                v_nova_quantidade := NEW.quantidade;
            ELSE
                -- Não permitir saída se não há estoque
                RAISE EXCEPTION 'Não é possível realizar saída sem estoque prévio do produto ID: %', NEW.produto_id;
            END IF;
            
            INSERT INTO public.estoque (produto_id, quantidade_atual, usuario_id)
            VALUES (NEW.produto_id, v_nova_quantidade, NEW.usuario_id);
        ELSE
            -- Calcular nova quantidade
            IF NEW.tipo_movimentacao = 'ENTRADA' THEN
                v_nova_quantidade := v_quantidade_atual + NEW.quantidade;
            ELSE -- SAIDA
                v_nova_quantidade := v_quantidade_atual - NEW.quantidade;
                
                -- Verificar se a quantidade não fica negativa
                IF v_nova_quantidade < 0 THEN
                    RAISE EXCEPTION 'Quantidade insuficiente em estoque. Disponível: %, Solicitado: %', v_quantidade_atual, NEW.quantidade;
                END IF;
            END IF;
            
            -- Atualizar estoque
            UPDATE public.estoque 
            SET quantidade_atual = v_nova_quantidade,
                usuario_id = NEW.usuario_id,
                updated_at = now()
            WHERE produto_id = NEW.produto_id;
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar estoque automaticamente
CREATE TRIGGER trigger_processar_movimentacao_estoque
    AFTER INSERT ON "public"."estoque_movimentacoes"
    FOR EACH ROW EXECUTE FUNCTION processar_movimentacao_estoque();

-- =============================================================================
-- COMENTÁRIOS NAS TABELAS
-- =============================================================================

COMMENT ON TABLE "public"."estoque" IS 'Estoque atual de produtos';
COMMENT ON COLUMN "public"."estoque"."produto_id" IS 'Referência ao produto';
COMMENT ON COLUMN "public"."estoque"."quantidade_atual" IS 'Quantidade atual em estoque';
COMMENT ON COLUMN "public"."estoque"."usuario_id" IS 'Usuário responsável pela última atualização';

COMMENT ON TABLE "public"."estoque_movimentacoes" IS 'Histórico de movimentações de estoque';
COMMENT ON COLUMN "public"."estoque_movimentacoes"."tipo_movimentacao" IS 'Tipo: ENTRADA ou SAIDA';
COMMENT ON COLUMN "public"."estoque_movimentacoes"."quantidade" IS 'Quantidade movimentada';
COMMENT ON COLUMN "public"."estoque_movimentacoes"."data_movimentacao" IS 'Data/hora da movimentação';

-- =============================================================================
-- RLS (ROW LEVEL SECURITY) - SE NECESSÁRIO
-- =============================================================================

-- Habilitar RLS nas tabelas (comentado por enquanto)
-- ALTER TABLE "public"."estoque" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."estoque_movimentacoes" ENABLE ROW LEVEL SECURITY;

-- Políticas RLS (implementar conforme necessidade do projeto)
-- CREATE POLICY "Users can view estoque" ON "public"."estoque" FOR SELECT USING (true);
-- CREATE POLICY "Users can insert estoque" ON "public"."estoque" FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update estoque" ON "public"."estoque" FOR UPDATE USING (true);