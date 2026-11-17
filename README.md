# AIP Gest - PWA Web Responsive

Aplicación PWA (Progressive Web App) para el control de préstamos de equipos, construida con **React + Vite + TypeScript + Tailwind CSS + Supabase**, desplegable en **Vercel**.

## Arquitectura

- **Frontend:** React 18 + TypeScript + Vite
- **Estilos:** Tailwind CSS (diseño Mobile-First)
- **Backend/Auth/Storage:** Supabase (clave pública/anon key únicamente en el navegador)
- **Enrutamiento:** React Router DOM
- **Estado global:** Store reactivo propio (patrón tipo Riverpod) bajo `src/providers`
- **Almacenamiento local offline:** localforage (IndexedDB) como reemplazo de Drift/SQLite para Web
- **PWA:** vite-plugin-pwa (Service Worker con Workbox + manifest.json)
- **Documentos:** jsPDF + jspdf-autotable (PDF), ExcelJS (Excel), file-saver (descarga)
- **Firmas digitales:** Canvas HTML5 + Supabase Storage (bucket `firmas`)

## Comandos para ejecutar localmente

```bash
# Instalar dependencias
npm install

# Ejecutar en modo desarrollo (http://localhost:5173)
npm run dev

# Compilar para producción (genera dist/)
npm run build

# Previsualizar la build de producción (http://localhost:4173)
npm run preview
```

## Variables de entorno

Copia `.env.example` a `.env` y configura tu proyecto Supabase:

```
VITE_SUPABASE_URL=https://tu-proyecto.supabase.co
VITE_SUPABASE_ANON_KEY=tu_anon_key_publica
VITE_APP_NAME=AIP Gest
```

**Nunca expongas la `service_role` key en el navegador.** Usa únicamente la `anon key` y las políticas RLS de Supabase.

## Despliegue en Vercel (con HTTPS)

El archivo `vercel.json` ya está configurado para despliegue estático con fallback de rutas (SPA) y cabeceras del Service Worker.

1. Sube el código a un repositorio Git (GitHub/GitLab/Bitbucket).
2. Conecta el repositorio en Vercel: "Add New Project".
3. Configuración del proyecto:
   - Framework preset: Vite
   - Build command: `npm run build`
   - Output directory: `dist`
   - Install command: `npm install`
4. Añade las variables de entorno (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_APP_NAME`) en Settings → Environment Variables.
5. Despliega. Vercel proporciona HTTPS automáticamente.
6. La PWA será instalable desde Chrome/Edge (opción "Instalar aplicación") y se abrirá como ventana independiente (`display: standalone`).

## Estructura principal

```
src/
  core/             configuración y cliente Supabase
  domain/           entidades e interfaces de repositorio (reglas de negocio)
  data/             datasources remotos (Supabase), local (IndexedDB), sincronización, servicios
  providers/        estado global (auth, sincronización)
  pages/            pantallas (login, dashboard, préstamos, equipos, docentes, historial, reportes, perfil)
  components/       UI común y navegación (Bottom Nav móvil, sidebar escritorio)
public/
  manifest.json     manifiesto PWA
  icons/            iconos de la aplicación
  sw.js             service worker generado por Workbox
```

## Funcionalidades conservadas (del proyecto Flutter original)

- Autenticación con Supabase, persistencia de sesión y control de acceso por rol (`encargado_aip` / `practicante`)
- Dashboard con estadísticas y actividad reciente
- Préstamos: creación, selección de docentes/equipos, firma digital, detalle, devoluciones
- Equipos: listado, búsqueda, detalle, registro, edición, cambio de estado
- Docentes: listado, búsqueda, registro, edición, detalle, activación/desactivación/eliminación
- Historial de préstamos con filtros
- Reportes generales con exportación PDF y Excel
- Perfil de usuario y cierre de sesión
- Sincronización offline: cola de operaciones pendientes, reintentos, estado de conexión

## Notas

- El proyecto original fue suministrado únicamente como carpeta `lib` de Flutter (sin `pubspec.yaml`, SDK de Flutter ni configuración web/Android), por lo que no fue posible ejecutar `flutter pub get` / `flutter build web`. Siguiendo la instrucción final, se reconstruyó la aplicación como PWA con React + Vite + TypeScript + Tailwind + Supabase, replicando **todas** las pantallas, reglas de negocio, roles y permisos del proyecto Flutter.
- Los iconos de la PWA se generaron en SVG (válidos para instalación) debido a que el servicio de generación de imágenes no estuvo disponible.
- El almacenamiento local usa `localforage` (IndexedDB) en lugar de Drift/SQLite `NativeDatabase`, incompatibles con Flutter Web.
