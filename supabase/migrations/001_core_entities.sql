-- Organizations
CREATE TABLE IF NOT EXISTS public.organizations (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    type character varying(100),
    user_id uuid,
    created_at timestamp with time zone DEFAULT now(),
    cnpj character varying(14),
    capacity integer,
    opening_date date,
    full_address text,
    zip_code character varying(9),
    district character varying(100),
    latitude numeric(10,8),
    longitude numeric(11,8),
    main_phone character varying(15),
    alt_phone character varying(15),
    institutional_email character varying(255),
    updated_at timestamp with time zone DEFAULT now(),
    state_id integer,
    city_id integer,
    address character varying(255),
    number character varying(20),
    address_complement character varying(100),
    CONSTRAINT organizations_pkey PRIMARY KEY (id)
);

-- Departments
CREATE TABLE IF NOT EXISTS public.departments (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    organization_id uuid NOT NULL,
    department_type character varying(100),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT departments_pkey PRIMARY KEY (id),
    CONSTRAINT departments_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);

-- Technical Responsibles
CREATE TABLE IF NOT EXISTS public.technical_responsibles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    organization_id uuid NOT NULL,
    responsible_type character varying(50) NOT NULL,
    name character varying(255) NOT NULL,
    document character varying(20),
    phone character varying(15),
    email character varying(255),
    notes text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT technical_responsibles_pkey PRIMARY KEY (id),
    CONSTRAINT technical_responsibles_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id) ON DELETE CASCADE
);