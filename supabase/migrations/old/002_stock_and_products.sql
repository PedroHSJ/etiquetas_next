-- Groups (Product Groups)
CREATE TABLE IF NOT EXISTS public.groups (
    id integer NOT NULL,
    name text NOT NULL,
    description text,
    CONSTRAINT groups_pkey PRIMARY KEY (id)
);

-- Products
CREATE TABLE IF NOT EXISTS public.products (
    id integer NOT NULL,
    name text NOT NULL,
    group_id integer,
    CONSTRAINT products_pkey PRIMARY KEY (id),
    CONSTRAINT products_group_id_fkey FOREIGN KEY (group_id) REFERENCES public.groups(id)
);

-- Create sequence for labels before creating the table
CREATE SEQUENCE IF NOT EXISTS public.labels_id_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;

-- Labels (Estoque/Etiquetas)
CREATE TABLE IF NOT EXISTS public.labels (
    id integer DEFAULT nextval('public.labels_id_seq'::regclass) NOT NULL,
    product_id integer,
    quantity integer DEFAULT 1,
    printed_at timestamp with time zone DEFAULT now(),
    user_id uuid,
    organization_id uuid,
    status character varying(100) DEFAULT 'printed'::character varying,
    notes text,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT labels_pkey PRIMARY KEY (id),
    CONSTRAINT labels_product_id_fkey FOREIGN KEY (product_id) REFERENCES public.products(id),
    CONSTRAINT labels_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id)
);