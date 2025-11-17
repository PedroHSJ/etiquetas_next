
INSERT INTO public.departments (id,name,organization_id,department_type,created_at) VALUES
	('89a9eaa6-1f83-4df5-a06f-c2660c264652'::uuid,'Produção/Cozinha',
    (SELECT id FROM public.organizations WHERE name = 'Rancho HGUJP' LIMIT 1),
    'producao','2025-11-17 11:45:14.51073-03'),
	('8d46addb-3fc7-4036-bdfb-9bf174437a83'::uuid,'Produção/Cozinha',
    (SELECT id FROM public.organizations WHERE name = 'Rancho HMAR' LIMIT 1),
    'producao','2025-11-17 11:46:22.531208-03');
