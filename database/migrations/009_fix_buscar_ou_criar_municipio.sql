-- =====================================================
-- MIGRAÇÃO 009: CORREÇÃO FUNÇÃO BUSCAR_OU_CRIAR_MUNICIPIO
-- =====================================================
-- Corrige a função para retornar dados completos do município
-- incluindo informações do estado
-- =====================================================

-- Remove a função existente primeiro
DROP FUNCTION IF EXISTS public.buscar_ou_criar_municipio(VARCHAR, VARCHAR, VARCHAR, VARCHAR, DECIMAL, DECIMAL);

-- Recria a função com retorno JSON
CREATE OR REPLACE FUNCTION public.buscar_ou_criar_municipio(
    p_nome VARCHAR(150),
    p_uf VARCHAR(2),
    p_codigo_ibge VARCHAR(10) DEFAULT NULL,
    p_cep VARCHAR(8) DEFAULT NULL,
    p_latitude DECIMAL(10,8) DEFAULT NULL,
    p_longitude DECIMAL(11,8) DEFAULT NULL
) RETURNS JSON AS $$
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION public.buscar_ou_criar_municipio IS 'Função para buscar município existente ou criar novo com dados do ViaCEP - retorna JSON com dados completos';