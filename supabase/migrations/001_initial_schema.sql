-- =============================================================================
-- AIP Gest - Migración inicial de Supabase
-- Archivo: supabase/migrations/001_initial_schema.sql
-- Ejecutar en: SQL Editor de tu proyecto Supabase
-- =============================================================================

-- 1. Extensiones
create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- 2. Tabla de perfiles de usuario (usuarios)
--    Sincronizada con auth.users. Aquí se guarda el rol (encargado_aip / practicante).
-- ---------------------------------------------------------------------------
create table if not exists public.usuarios (
  id uuid not null primary key references auth.users(id) on delete cascade,
  email text,
  rol text not null default 'practicante' check (rol in ('encargado_aip', 'practicante')),
  nombre_completo text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 3. Tabla de equipos
-- ---------------------------------------------------------------------------
create table if not exists public.equipos (
  id uuid not null primary key default gen_random_uuid(),
  codigo_patrimonial text not null unique,
  tipo text not null check (tipo in ('laptop_dell', 'laptop_hp', 'cargador', 'extension', 'otro_accesorio')),
  marca text,
  modelo text,
  numero_serie text,
  estado text not null default 'disponible' check (estado in ('disponible', 'prestado', 'mantenimiento', 'dado_de_baja')),
  observaciones text,
  imagen_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 4. Tabla de docentes
-- ---------------------------------------------------------------------------
create table if not exists public.docentes (
  id uuid not null primary key default gen_random_uuid(),
  nombre_completo text not null,
  departamento jsonb, -- almacena { grado, seccion, turno }
  activo boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 5. Tabla de préstamos
-- ---------------------------------------------------------------------------
create table if not exists public.prestamos (
  id uuid not null primary key default gen_random_uuid(),
  docente_id uuid not null references public.docentes(id) on delete restrict,
  encargado_id uuid not null references auth.users(id) on delete restrict,
  fecha_hora_inicio timestamptz not null default now(),
  fecha_hora_fin_estimada timestamptz,
  estado text not null default 'activo' check (estado in ('activo', 'parcial', 'devuelto')),
  observaciones text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 6. Tabla intermedia préstamo_equipos (equipos asignados a un préstamo)
-- ---------------------------------------------------------------------------
create table if not exists public.prestamo_equipos (
  id uuid not null primary key default gen_random_uuid(),
  prestamo_id uuid not null references public.prestamos(id) on delete cascade,
  equipo_id uuid not null references public.equipos(id) on delete restrict,
  fecha_devolucion_real timestamptz,
  observaciones_devolucion text,
  unique(prestamo_id, equipo_id)
);

-- ---------------------------------------------------------------------------
-- 7. Tabla de firmas digitales
-- ---------------------------------------------------------------------------
create table if not exists public.firmas_digitales (
  id uuid not null primary key default gen_random_uuid(),
  prestamo_id uuid references public.prestamos(id) on delete cascade,
  devolucion_id uuid, -- referencia lógica a la operación de devolución
  usuario_id uuid not null references auth.users(id) on delete restrict,
  rol text not null,
  nombre_completo text not null,
  storage_path text not null,
  mime_type text not null default 'image/png',
  created_at timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- 8. Índices para rendimiento
-- ---------------------------------------------------------------------------
create index if not exists idx_equipos_estado on public.equipos(estado);
create index if not exists idx_equipos_codigo on public.equipos(codigo_patrimonial);
create index if not exists idx_docentes_activo on public.docentes(activo);
create index if not exists idx_prestamos_docente on public.prestamos(docente_id);
create index if not exists idx_prestamos_encargado on public.prestamos(encargado_id);
create index if not exists idx_prestamos_estado on public.prestamos(estado);
create index if not exists idx_prestamos_created_at on public.prestamos(created_at);
create index if not exists idx_prestamo_equipos_prestamo on public.prestamo_equipos(prestamo_id);
create index if not exists idx_prestamo_equipos_equipo on public.prestamo_equipos(equipo_id);
create index if not exists idx_firmas_prestamo on public.firmas_digitales(prestamo_id);
create index if not exists idx_firmas_usuario on public.firmas_digitales(usuario_id);

-- ---------------------------------------------------------------------------
-- 9. Función trigger para actualizar updated_at automáticamente
-- ---------------------------------------------------------------------------
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_usuarios_updated_at
  before update on public.usuarios
  for each row
  execute function public.set_updated_at();

create trigger trg_equipos_updated_at
  before update on public.equipos
  for each row
  execute function public.set_updated_at();

create trigger trg_docentes_updated_at
  before update on public.docentes
  for each row
  execute function public.set_updated_at();

create trigger trg_prestamos_updated_at
  before update on public.prestamos
  for each row
  execute function public.set_updated_at();

create trigger trg_prestamo_equipos_updated_at
  before update on public.prestamo_equipos
  for each row
  execute function public.set_updated_at();

create trigger trg_firmas_digitales_updated_at
  before update on public.firmas_digitales
  for each row
  execute function public.set_updated_at();

-- ---------------------------------------------------------------------------
-- 10. Habilitar Row Level Security (RLS) en todas las tablas
-- ---------------------------------------------------------------------------
alter table public.usuarios enable row level security;
alter table public.equipos enable row level security;
alter table public.docentes enable row level security;
alter table public.prestamos enable row level security;
alter table public.prestamo_equipos enable row level security;
alter table public.firmas_digitales enable row level security;

-- ---------------------------------------------------------------------------
-- 11. Políticas RLS
-- ---------------------------------------------------------------------------

-- 11.1 Usuarios (perfiles)
create policy "usuarios_select_own" on public.usuarios
  for select using (auth.uid() = id);

create policy "usuarios_select_all_encargado" on public.usuarios
  for select using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

create policy "usuarios_insert_own" on public.usuarios
  for insert with check (auth.uid() = id);

create policy "usuarios_update_own" on public.usuarios
  for update using (auth.uid() = id);

-- 11.2 Equipos
create policy "equipos_select_auth" on public.equipos
  for select using (auth.role() = 'authenticated');

create policy "equipos_insert_encargado" on public.equipos
  for insert with check (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

create policy "equipos_update_encargado" on public.equipos
  for update using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

create policy "equipos_delete_encargado" on public.equipos
  for delete using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

-- 11.3 Docentes
create policy "docentes_select_auth" on public.docentes
  for select using (auth.role() = 'authenticated');

create policy "docentes_insert_encargado" on public.docentes
  for insert with check (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

create policy "docentes_update_encargado" on public.docentes
  for update using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

create policy "docentes_delete_encargado" on public.docentes
  for delete using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

-- 11.4 Préstamos
create policy "prestamos_select_auth" on public.prestamos
  for select using (auth.role() = 'authenticated');

create policy "prestamos_insert_auth" on public.prestamos
  for insert with check (auth.uid() = encargado_id);

create policy "prestamos_update_encargado" on public.prestamos
  for update using (
    exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'encargado_aip'
    )
  );

create policy "prestamos_update_practicante_devolucion" on public.prestamos
  for update using (
    auth.uid() = encargado_id
    and exists (
      select 1 from public.usuarios u
      where u.id = auth.uid() and u.rol = 'practicante'
    )
  );

-- 11.5 Préstamo_equipos
create policy "prestamo_equipos_select_auth" on public.prestamo_equipos
  for select using (auth.role() = 'authenticated');

create policy "prestamo_equipos_insert_auth" on public.prestamo_equipos
  for insert with check (
    exists (
      select 1 from public.prestamos p
      where p.id = prestamo_id and p.encargado_id = auth.uid()
    )
  );

create policy "prestamo_equipos_update_devolucion" on public.prestamo_equipos
  for update using (
    exists (
      select 1 from public.prestamos p
      where p.id = prestamo_id and p.encargado_id = auth.uid()
    )
  );

-- 11.6 Firmas digitales
create policy "firmas_select_auth" on public.firmas_digitales
  for select using (auth.role() = 'authenticated');

create policy "firmas_insert_auth" on public.firmas_digitales
  for insert with check (auth.uid() = usuario_id);

-- ---------------------------------------------------------------------------
-- 12. Storage: bucket para firmas digitales
-- ---------------------------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('firmas', 'firmas', false)
on conflict (id) do nothing;

-- Políticas de Storage para el bucket firmas
create policy "firmas_storage_upload_auth"
on storage.objects for insert
to authenticated
with check (bucket_id = 'firmas');

create policy "firmas_storage_select_auth"
on storage.objects for select
to authenticated
using (bucket_id = 'firmas');

create policy "firmas_storage_delete_owner"
on storage.objects for delete
to authenticated
using (bucket_id = 'firmas' and owner = auth.uid());

-- ---------------------------------------------------------------------------
-- 13. Comentarios de tablas (documentación)
-- ---------------------------------------------------------------------------
comment on table public.usuarios is 'Perfiles de usuario con rol (encargado_aip / practicante)';
comment on table public.equipos is 'Inventario de equipos patrimoniales';
comment on table public.docentes is 'Docentes que pueden recibir equipos en préstamo';
comment on table public.prestamos is 'Registro de préstamos de equipos';
comment on table public.prestamo_equipos is 'Detalle de equipos por préstamo y sus devoluciones';
comment on table public.firmas_digitales is 'Metadatos de firmas digitales almacenadas en Supabase Storage';

-- =============================================================================
-- Fin de la migración 001_initial_schema.sql
-- =============================================================================
