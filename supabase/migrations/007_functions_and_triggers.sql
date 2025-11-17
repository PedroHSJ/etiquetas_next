-- 008_functions_and_triggers.sql
-- Custom functions

CREATE OR REPLACE FUNCTION public.find_or_create_city(
    p_name character varying,
    p_state_code character varying,
    p_ibge_code character varying DEFAULT NULL,
    p_zip_code character varying DEFAULT NULL,
    p_latitude numeric DEFAULT NULL,
    p_longitude numeric DEFAULT NULL
) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
    v_state_id INTEGER;
    v_city_id INTEGER;
    v_result JSON;
BEGIN
    SELECT id INTO v_state_id FROM public.states WHERE code = p_state_code;
    IF v_state_id IS NULL THEN
        RAISE EXCEPTION 'State not found: %', p_state_code;
    END IF;
    SELECT id INTO v_city_id FROM public.cities WHERE state_id = v_state_id AND name = p_name;
    IF v_city_id IS NULL THEN
        INSERT INTO public.cities (state_id, name, ibge_code, zip_code_start, latitude, longitude)
        VALUES (v_state_id, p_name, p_ibge_code, p_zip_code, p_latitude, p_longitude)
        RETURNING id INTO v_city_id;
    ELSE
        UPDATE public.cities SET
            ibge_code = COALESCE(p_ibge_code, ibge_code),
            zip_code_start = COALESCE(p_zip_code, zip_code_start),
            latitude = COALESCE(p_latitude, latitude),
            longitude = COALESCE(p_longitude, longitude),
            updated_at = NOW()
        WHERE id = v_city_id;
    END IF;
    SELECT json_build_object(
        'id', c.id,
        'name', c.name,
        'state', json_build_object(
            'id', s.id,
            'code', s.code,
            'name', s.name
        )
    ) INTO v_result
    FROM public.cities c
    JOIN public.states s ON s.id = c.state_id
    WHERE c.id = v_city_id;
    RETURN v_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.get_multiple_users_data(user_ids uuid[]) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  users_data JSON;
BEGIN
  SELECT json_agg(
    json_build_object(
      'id', au.id,
      'email', au.email,
      'name', COALESCE(
        au.raw_user_meta_data->>'full_name',
        au.raw_user_meta_data->>'name',
        split_part(au.email, '@', 1),
        'User'
      ),
      'avatar_url', COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture'
      ),
      'avatarUrl', COALESCE(
        au.raw_user_meta_data->>'avatar_url',
        au.raw_user_meta_data->>'picture'
      ),
      'picture', COALESCE(
        au.raw_user_meta_data->>'picture',
        au.raw_user_meta_data->>'avatar_url'
      )
    )
  ) INTO users_data
  FROM auth.users au
  WHERE au.id = ANY(user_ids);
  RETURN COALESCE(users_data, '[]'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_data_json(user_id uuid) RETURNS json
    LANGUAGE plpgsql SECURITY DEFINER
AS $$
DECLARE
  user_data JSON;
BEGIN
  SELECT json_build_object(
    'id', au.id,
    'email', au.email,
    'name', COALESCE(
      au.raw_user_meta_data->>'full_name',
      au.raw_user_meta_data->>'name',
      split_part(au.email, '@', 1),
      'User'
    )
  ) INTO user_data
  FROM auth.users au
  WHERE au.id = user_id;
  RETURN COALESCE(user_data, '{"name": "User", "email": ""}'::JSON);
END;
$$;

CREATE OR REPLACE FUNCTION public.get_user_info(user_id uuid) RETURNS TABLE(id uuid, email character varying, name text, picture text, avatar_url text)
    LANGUAGE plpgsql SECURITY DEFINER
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

CREATE OR REPLACE FUNCTION public.update_updated_at_column() RETURNS trigger
    LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$;

-- Triggers
CREATE OR REPLACE TRIGGER update_cities_updated_at 
    BEFORE UPDATE ON public.cities 
    FOR EACH ROW 
    EXECUTE FUNCTION public.update_updated_at_column();
