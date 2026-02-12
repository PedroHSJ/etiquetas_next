-- Invites
CREATE TABLE IF NOT EXISTS public.invites (
    id uuid DEFAULT gen_random_uuid() NOT NULL,
    email character varying(255) NOT NULL,
    organization_id uuid NOT NULL,
    profile_id uuid NOT NULL,
    status character varying(50) DEFAULT 'pending'::character varying,
    invite_token character varying(255) NOT NULL,
    expires_at timestamp with time zone DEFAULT (now() + '7 days'::interval),
    invited_by uuid NOT NULL,
    created_at timestamp with time zone DEFAULT now(),
    accepted_at timestamp with time zone,
    accepted_by uuid,
    rejected_at timestamp with time zone,
    rejected_by uuid,
    CONSTRAINT invites_pkey PRIMARY KEY (id),
    CONSTRAINT invites_organization_id_fkey FOREIGN KEY (organization_id) REFERENCES public.organizations(id),
    CONSTRAINT invites_profile_id_fkey FOREIGN KEY (profile_id) REFERENCES public.profiles(id)
);