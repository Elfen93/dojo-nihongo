# Dojo 日本語

App personal de japonés (N5 → N1) que mezcla WaniKani (kanji y vocabulario con SRS escrito), Bunpro (gramática con huecos) y Satori Reader (lecturas con glosario), con exámenes periódicos en formato JLPT. Interfaz y significados en español.

- Progreso guardado en Supabase (Postgres) por usuario, sincronizado entre dispositivos.
- Instalable como app (PWA) en móvil y ordenador; funciona sin conexión y sincroniza al volver.
- Sincronización con WaniKani (directa desde el navegador) y Bunpro (a través de una función de Supabase).
- Niveles N3, N2 y N1 generados con la API de Claude al llegar a ellos.

## Puesta en marcha (una sola vez)

### 1. Supabase
1. Crea un proyecto en https://supabase.com (plan gratuito).
2. SQL Editor → pega `supabase/schema.sql` → Run.
3. Authentication → Providers: activa **Email** (enlace mágico). Opcional: **Google** (necesita credenciales OAuth de Google Cloud).
4. Authentication → URL Configuration → Site URL: la URL donde se publique la app (por ejemplo `https://USUARIO.github.io/dojo-nihongo/`). Añádela también en Redirect URLs.
5. Project Settings → API: copia **Project URL** y **anon public key**.

### 1b. Autorización desde la app
Ejecuta también `supabase/schema2.sql` y `supabase/schema3.sql`. En `schema3.sql` cambia el correo del superusuario si no es el tuyo. Desde entonces, en Ajustes verás el panel "Cuentas autorizadas" para dar y quitar acceso. Toda la seguridad real está en las políticas RLS y en las funciones, que consultan esa misma tabla.

### 2. Funciones (Bunpro y generación de niveles)
Con la CLI de Supabase (`npm i -g supabase`):
```
supabase login
supabase link --project-ref TU_REF
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...
supabase functions deploy bunpro --no-verify-jwt
supabase functions deploy generate
```
Sin estas funciones la app sigue funcionando: Bunpro no se sincroniza y los niveles N3+ se generan copiando el prompt a mano.

### 3. Publicación
- **GitHub Pages**: Settings → Pages → Source: *Deploy from a branch*, rama `main`, carpeta `/ (root)`. `index.html` va construido en el repositorio (`python3 build.py` antes de cada push) y `config.js` lleva la URL y la anon key de Supabase (públicas por diseño).
- **Cualquier otro hosting estático** (Netlify, Cloudflare Pages, Vercel): ejecuta `python3 build.py`, rellena `config.js` y sube la carpeta.

## Desarrollo
- `src/` código de la app por módulos; `data/` contenido (kanji, vocabulario, gramática, lecturas); `python3 build.py` genera `index.html`.
- Para editar contenido, toca los archivos de `data/` y vuelve a construir.
