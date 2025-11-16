-- 007_auxiliary_tables.sql
-- Auxiliary/Domain tables

-- States (Brazilian states)
CREATE TABLE IF NOT EXISTS public.states (
    id integer NOT NULL DEFAULT nextval('public.states_id_seq'::regclass),
    code character varying(2) NOT NULL,
    name character varying(100) NOT NULL,
    region character varying(50) NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT states_pkey PRIMARY KEY (id),
    CONSTRAINT states_code_key UNIQUE (code)
);

-- Cities (Brazilian municipalities)
CREATE TABLE IF NOT EXISTS public.cities (
    id integer NOT NULL DEFAULT nextval('public.cities_id_seq'::regclass),
    state_id integer NOT NULL,
    ibge_code character varying(10),
    name character varying(150) NOT NULL,
    zip_code_start character varying(8),
    zip_code_end character varying(8),
    latitude numeric(10,8),
    longitude numeric(11,8),
    created_at timestamp with time zone DEFAULT now(),
    updated_at timestamp with time zone DEFAULT now(),
    CONSTRAINT cities_pkey PRIMARY KEY (id),
    CONSTRAINT cities_ibge_code_key UNIQUE (ibge_code),
    CONSTRAINT cities_state_id_fkey FOREIGN KEY (state_id) REFERENCES public.states(id)
);

ALTER TABLE public.organizations
    ADD CONSTRAINT organizations_state_id_fkey
    FOREIGN KEY (state_id) REFERENCES public.states(id),
    ADD CONSTRAINT organizations_city_id_fkey
    FOREIGN KEY (city_id) REFERENCES public.cities(id);

-- Functionalities (System features/modules)
CREATE TABLE IF NOT EXISTS public.functionalities (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    route character varying(255),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT functionalities_pkey PRIMARY KEY (id),
    CONSTRAINT functionalities_name_key UNIQUE (name)
);

-- Profiles (User access profiles/roles)
CREATE TABLE IF NOT EXISTS public.profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    name character varying(255) NOT NULL,
    description text,
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT profiles_pkey PRIMARY KEY (id),
    CONSTRAINT profiles_name_key UNIQUE (name)
);

-- Permissions (Access permissions by profile)
CREATE TABLE IF NOT EXISTS public.permissions (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    functionality_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    action character varying(100),
    active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT permissions_pkey PRIMARY KEY (id),
    CONSTRAINT permissions_functionality_id_fkey FOREIGN KEY (functionality_id) REFERENCES public.functionalities(id),
    CONSTRAINT permissions_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);

-- User Organizations (Many-to-many relationship)
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

-- User Profiles (User profile assignments)
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    user_organization_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    active boolean DEFAULT true,
    start_date timestamp with time zone DEFAULT now(),
    created_at timestamp with time zone DEFAULT now(),
    CONSTRAINT user_profiles_pkey PRIMARY KEY (id),
    CONSTRAINT user_profiles_user_organization_id_fkey FOREIGN KEY (user_organization_id) REFERENCES public.user_organizations(id),
    CONSTRAINT user_profiles_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);
