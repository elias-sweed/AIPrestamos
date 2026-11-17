insert into public.usuarios (id, email, rol, nombre_completo)
values (
  '599dfa1f-d9b2-4a51-ab7a-6302f0cd712f',                       
  'prestar@jimenezpimentel.edu.pe',                      
  'encargado_aip',
  'Administrador AIP'
)
on conflict (id) do update set
  rol = 'encargado_aip',
  nombre_completo = excluded.nombre_completo,
  email = excluded.email,
  updated_at = now();


select id, email, rol, nombre_completo, created_at
from public.usuarios
where id = '599dfa1f-d9b2-4a51-ab7a-6302f0cd712f';

-- =============================================================================
-- Fin del script
-- =============================================================================
