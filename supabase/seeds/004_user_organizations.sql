INSERT INTO public.user_organizations (id, user_id, organization_id, profile_id, active, entry_date, exit_date, created_at)
VALUES (
  '99099ccd-0382-4a7f-8096-108811d5b76d'::uuid,
  'a5371483-5545-4dbf-9ab9-93a4fda5be81'::uuid,
  '1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1),
  true,
  '2025-11-17 11:45:14.517401-03',
  NULL,
  '2025-11-17 11:45:14.517401-03'
),
(
  'f28715b2-7e1e-420a-82a0-c72b502fe599'::uuid,
  'b4bfb6a4-445f-4be7-8cc3-037b91e27ee7'::uuid,
  '08ccdabd-b8e0-48dc-82c6-f69a696e24c3'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'cozinheiro' LIMIT 1),
  true,
  '2025-11-17 11:46:22.537707-03',
  NULL,
  '2025-11-17 11:46:22.537707-03'
),
(
  'e656a21f-d8bc-4e03-8b0e-1505a31f4911'::uuid,
  '01961561-3b13-424b-bd33-4631b9bd273b'::uuid,
  '1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'estoquista' LIMIT 1),
  true,
  '2025-11-17 11:59:40.612436-03',
  NULL,
  '2025-11-17 11:59:40.612436-03'
),
(
  '84dc9180-40d4-41d0-9ffa-0fa266c9696c'::uuid,
  'b4bfb6a4-445f-4be7-8cc3-037b91e27ee7'::uuid,
  '1e1e7ee8-72d5-4394-a017-43c7dd3789a7'::uuid,
  (SELECT id FROM public.profiles WHERE name ILIKE 'gestor' LIMIT 1),
  true,
  '2025-11-17 12:00:21.961516-03',
  NULL,
  '2025-11-17 12:00:21.961516-03'
);
