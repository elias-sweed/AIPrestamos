-- =============================================================================
-- AIP Gest - Datos iniciales (seed)
-- Archivo: supabase/migrations/002_seed_datos_iniciales.sql
-- Ejecutar DESPUÉS de 001_initial_schema.sql
-- =============================================================================

-- Ejemplo de equipos iniciales (solo si la tabla está vacía)
insert into public.equipos (codigo_patrimonial, tipo, marca, modelo, numero_serie, estado, observaciones)
select *
from (values
  ('EQ-001', 'laptop_dell', 'Dell', 'Latitude 5430', 'SN123456', 'disponible', 'Laptop de oficina'),
  ('EQ-002', 'laptop_hp', 'HP', 'ProBook 450', 'SN789012', 'disponible', 'Laptop administrativa'),
  ('EQ-003', 'cargador', null, null, null, 'disponible', 'Cargador universal'),
  ('EQ-004', 'extension', null, null, null, 'disponible', 'Extensión eléctrica'),
  ('EQ-005', 'otro_accesorio', null, null, null, 'dado_de_baja', 'Accesorio dañado')
) as v(codigo_patrimonial, tipo, marca, modelo, numero_serie, estado, observaciones)
where not exists (select 1 from public.equipos);

-- Ejemplo de docentes iniciales (solo si la tabla está vacía)
insert into public.docentes (nombre_completo, departamento, activo)
select *
from (values
  ('Juan Pérez García', '{"grado": "Primaria", "seccion": "A", "turno": "mañana"}'::jsonb, true),
  ('María López Sánchez', '{"grado": "Secundaria", "seccion": "B", "turno": "tarde"}'::jsonb, true),
  ('Carlos Ramírez Díaz', '{"grado": "Inicial", "seccion": "C", "turno": "mañana"}'::jsonb, false)
) as v(nombre_completo, departamento, activo)
where not exists (select 1 from public.docentes);

-- Nota: Los usuarios de autenticación (auth.users) se crean desde el panel de Supabase
-- o mediante signup en la app. Después se debe insertar su perfil en public.usuarios
-- con el rol correspondiente (encargado_aip o practicante).

-- =============================================================================
-- Fin del seed 002_seed_datos_iniciales.sql
-- =============================================================================
