INSERT INTO public.unit_of_measure (code, description) VALUES
    ('un', 'Unidade'),
    ('kg', 'Quilograma'),
    ('g',  'Grama'),
    ('l',  'Litro'),
    ('ml', 'Mililitro'),
    ('cx', 'Caixa'),
    ('pct', 'Pacote')
ON CONFLICT (code) DO NOTHING;
