
INSERT INTO public.organizations (id,name,"type",created_by,created_at,cnpj,capacity,opening_date,full_address,zip_code,district,latitude,longitude,main_phone,alt_phone,institutional_email,updated_at,state_id,city_id,address,"number",address_complement) VALUES
	('08ccdabd-b8e0-48dc-82c6-f69a696e24c3'::uuid,'Rancho HMAR','uan',
    (SELECT id FROM auth.users WHERE email = 'pedrohenriquesj.pro@gmail.com' LIMIT 1),
    '2025-11-17 11:46:22.523937-03','84643764834948',NULL,NULL,NULL,'','',NULL,NULL,NULL,NULL,NULL,'2025-11-17 11:46:22.523937-03',NULL,NULL,'','',''),
	('1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,'Rancho HGUJP','uan',
    (SELECT id FROM auth.users WHERE email = 'piterhenou@gmail.com' LIMIT 1),
    '2025-11-17 11:45:14.502884-03','43434555563223',NULL,NULL,NULL,'','',NULL,NULL,'83991514481',NULL,NULL,'2025-11-17 11:45:14.502884-03',NULL,NULL,'','','');
