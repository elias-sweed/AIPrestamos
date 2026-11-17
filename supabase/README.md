# Supabase - AIP Gest

Esta carpeta contiene la definición de la base de datos para el proyecto **AIP Gest**.

## Estructura

```
supabase/
├── migrations/
│   ├── 001_initial_schema.sql   # Esquema completo: tablas, relaciones, RLS, Storage
│   └── 002_seed_datos_iniciales.sql # Datos de ejemplo (opcional)
└── README.md                    # Este archivo
```

## Cómo aplicar las migraciones

1. Inicia sesión en [Supabase](https://app.supabase.com).
2. Abre tu proyecto.
3. Ve a **SQL Editor** en el menú lateral.
4. Crea una nueva consulta y pega el contenido de `001_initial_schema.sql`.
5. Ejecuta (Run).
6. Opcional: ejecuta `002_seed_datos_iniciales.sql` para cargar datos de ejemplo.

## Tablas creadas

| Tabla | Descripción |
|-------|-------------|
| `usuarios` | Perfiles vinculados a `auth.users` con rol (`encargado_aip` / `practicante`) |
| `equipos` | Inventario de equipos patrimoniales |
| `docentes` | Docentes con grado, sección y turno |
| `prestamos` | Cabecera de préstamos de equipos |
| `prestamo_equipos` | Detalle de equipos por préstamo |
| `firmas_digitales` | Metadatos de firmas digitales (ruta en Storage) |

## Storage

Se crea el bucket privado `firmas` para almacenar las imágenes PNG de las firmas digitales.

## Variables de entorno (.env)

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
```

**Importante:** Solo usa la `anon key` pública en el navegador. Nunca expongas la `service_role` key.

## Seguridad (RLS)

Todas las tablas tienen Row Level Security habilitado:
- `encargado_aip`: puede gestionar equipos, docentes, reportes y préstamos completos.
- `practicante`: puede ver todo, crear préstamos y registrar devoluciones sobre sus propios préstamos.

No se confía únicamente en ocultar botones en la interfaz; las políticas RLS protegen los datos en la base de datos.
