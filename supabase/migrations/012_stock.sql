-- =============================================================================
-- STOCK MODULE - TABLES
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.unit_of_measure (
    code character varying(10) PRIMARY KEY,
    description character varying(100) NOT NULL
);

-- Stock Table (current balance per product)
CREATE TABLE IF NOT EXISTS "public"."stock" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "productId" integer NOT NULL,
    "unit_of_measure_code" character varying(10) DEFAULT 'un' NOT NULL,
    "current_quantity" numeric(10,3) DEFAULT 0 NOT NULL,
    "userId" uuid NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    "updated_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "stock_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_productId_unique" UNIQUE ("productId"),
    CONSTRAINT "stock_current_quantity_check" CHECK ("current_quantity" >= 0),
    CONSTRAINT "stock_unit_of_measure_code_fkey" FOREIGN KEY ("unit_of_measure_code") REFERENCES public.unit_of_measure(code)
);

-- Stock Movements Table (entry and exit history)
CREATE TABLE IF NOT EXISTS "public"."stock_movements" (
    "id" uuid DEFAULT gen_random_uuid() NOT NULL,
    "productId" integer NOT NULL,
    "userId" uuid NOT NULL,
    "movement_type" text NOT NULL,
    "quantity" numeric(10,3) NOT NULL,
    "unit_of_measure_code" character varying(10) DEFAULT 'un' NOT NULL,
    "observation" text,
    "movement_date" timestamp with time zone DEFAULT now() NOT NULL,
    "created_at" timestamp with time zone DEFAULT now() NOT NULL,
    CONSTRAINT "stock_movements_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "stock_movements_type_check" CHECK ("movement_type" IN ('ENTRADA', 'SAIDA')),
    CONSTRAINT "stock_movements_quantity_check" CHECK ("quantity" > 0),
    CONSTRAINT "stock_movements_uom_fkey" FOREIGN KEY ("unit_of_measure_code") REFERENCES public.unit_of_measure(code)
);

-- =============================================================================
-- INDEXES
-- =============================================================================

CREATE INDEX IF NOT EXISTS "idx_stock_productId" ON "public"."stock" ("productId");
CREATE INDEX IF NOT EXISTS "idx_stock_userId" ON "public"."stock" ("userId");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_productId" ON "public"."stock_movements" ("productId");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_userId" ON "public"."stock_movements" ("userId");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_date" ON "public"."stock_movements" ("movement_date");
CREATE INDEX IF NOT EXISTS "idx_stock_movements_type" ON "public"."stock_movements" ("movement_type");

-- =============================================================================
-- FOREIGN KEYS
-- =============================================================================

-- FK to products (assuming products table exists with integer id)
ALTER TABLE "public"."stock" 
ADD CONSTRAINT "stock_productId_fkey" 
FOREIGN KEY ("productId") REFERENCES "public"."products" ("id") ON DELETE CASCADE;

ALTER TABLE "public"."stock_movements" 
ADD CONSTRAINT "stock_movements_productId_fkey" 
FOREIGN KEY ("productId") REFERENCES "public"."products" ("id") ON DELETE CASCADE;

-- FK to users (assuming auth.users table exists)
ALTER TABLE "public"."stock" 
ADD CONSTRAINT "stock_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "auth"."users" ("id") ON DELETE RESTRICT;

ALTER TABLE "public"."stock_movements" 
ADD CONSTRAINT "stock_movements_userId_fkey" 
FOREIGN KEY ("userId") REFERENCES "auth"."users" ("id") ON DELETE RESTRICT;

-- =============================================================================
-- TRIGGERS FOR UPDATED_AT
-- =============================================================================

-- Function to update updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for stock table
CREATE TRIGGER update_stock_updated_at 
    BEFORE UPDATE ON "public"."stock" 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- STOCK MOVEMENT FUNCTION
-- =============================================================================

-- Function that automatically updates stock when there's a movement
CREATE OR REPLACE FUNCTION process_stock_movement()
RETURNS TRIGGER AS $$
DECLARE
    v_current_quantity NUMERIC;
    v_new_quantity NUMERIC;
    v_current_unit character varying(10);
BEGIN
    -- If INSERT (new movement)
    IF TG_OP = 'INSERT' THEN
        -- Get current quantity or create record if doesn't exist
        SELECT current_quantity, unit_of_measure_code
        INTO v_current_quantity, v_current_unit
        FROM public.stock 
        WHERE "productId" = NEW."productId";
        
        -- If stock record doesn't exist, create one
        IF v_current_quantity IS NULL THEN
            IF NEW.movement_type = 'ENTRADA' THEN
                v_new_quantity := NEW.quantity;
            ELSE
                -- Don't allow exit without prior stock
                RAISE EXCEPTION 'Cannot perform exit without prior stock for product ID: %', NEW."productId";
            END IF;
            
            INSERT INTO public.stock ("productId", current_quantity, unit_of_measure_code, "userId")
            VALUES (NEW."productId", v_new_quantity, NEW.unit_of_measure_code, NEW."userId");
        ELSE
            IF v_current_unit IS NOT NULL AND v_current_unit <> NEW.unit_of_measure_code THEN
                RAISE EXCEPTION 'Unit mismatch for product ID %, expected %, received %', NEW."productId", v_current_unit, NEW.unit_of_measure_code;
            END IF;
            -- Calculate new quantity
            IF NEW.movement_type = 'ENTRADA' THEN
                v_new_quantity := v_current_quantity + NEW.quantity;
            ELSE -- SAIDA
                v_new_quantity := v_current_quantity - NEW.quantity;
                
                -- Check if quantity doesn't become negative
                IF v_new_quantity < 0 THEN
                    RAISE EXCEPTION 'Insufficient quantity in stock. Available: %, Requested: %', v_current_quantity, NEW.quantity;
                END IF;
            END IF;
            
            -- Update stock
            UPDATE public.stock 
            SET current_quantity = v_new_quantity,
                unit_of_measure_code = COALESCE(v_current_unit, NEW.unit_of_measure_code),
                "userId" = NEW."userId",
                updated_at = now()
            WHERE "productId" = NEW."productId";
        END IF;
        
        RETURN NEW;
    END IF;
    
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update stock
CREATE TRIGGER trigger_process_stock_movement
    AFTER INSERT ON "public"."stock_movements"
    FOR EACH ROW EXECUTE FUNCTION process_stock_movement();

-- =============================================================================
-- TABLE COMMENTS
-- =============================================================================

COMMENT ON TABLE "public"."stock" IS 'Current product stock';
COMMENT ON COLUMN "public"."stock"."productId" IS 'Product reference';
COMMENT ON COLUMN "public"."stock"."current_quantity" IS 'Current quantity in stock';
COMMENT ON COLUMN "public"."stock"."userId" IS 'User responsible for last update';

COMMENT ON TABLE "public"."stock_movements" IS 'Stock movement history';
COMMENT ON COLUMN "public"."stock_movements"."movement_type" IS 'Type: ENTRADA (entry) or SAIDA (exit)';
COMMENT ON COLUMN "public"."stock_movements"."quantity" IS 'Quantity moved';
COMMENT ON COLUMN "public"."stock_movements"."movement_date" IS 'Movement date/time';

-- =============================================================================
-- RLS (ROW LEVEL SECURITY) - IF NEEDED
-- =============================================================================

-- Enable RLS on tables (commented for now)
-- ALTER TABLE "public"."stock" ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE "public"."stock_movements" ENABLE ROW LEVEL SECURITY;

-- RLS policies (implement according to project needs)
-- CREATE POLICY "Users can view stock" ON "public"."stock" FOR SELECT USING (true);
-- CREATE POLICY "Users can insert stock" ON "public"."stock" FOR INSERT WITH CHECK (true);
-- CREATE POLICY "Users can update stock" ON "public"."stock" FOR UPDATE USING (true);
