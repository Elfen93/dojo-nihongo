# Dojo 日本語 en Android

La app es una PWA instalable. Hay tres caminos, de menos a más trabajo. Los tres usan **la misma app web**: lo que publiques en GitHub se actualiza solo en el móvil, sin volver a instalar nada.

## 1. Instalar ya, sin tienda (2 minutos)
En Chrome para Android abre https://elfen93.github.io/dojo-nihongo/ → menú ⋮ → **Instalar aplicación** (o "Añadir a pantalla de inicio"). Queda con su icono, pantalla completa, funciona sin conexión y recibe notificaciones. El inicio de sesión con Google funciona porque corre en Chrome.

## 2. APK para repartir a mano (gratis)
1. Entra en https://www.pwabuilder.com y pega la URL de la app.
2. **Package for stores → Android**. Opciones: *Package ID* `app.dojonihongo` (o el tuyo), *App name* "Dojo 日本語", *Display mode* Standalone, *Signing key* → "Create new" (guarda el `.keystore` y su contraseña: sin ellos no podrás actualizar la app).
3. Descarga el zip: trae un `.apk` (para instalar en tu móvil o enviarlo) y un `.aab` (para Google Play) y un `assetlinks.json`.

## 3. Google Play (25 USD una sola vez)
1. Cuenta de desarrollador en https://play.google.com/console (25 USD, pago único).
2. Sube el `.aab` del paso 2, rellena ficha, capturas, política de privacidad y clasificación.
3. Cuentas personales nuevas deben pasar una **prueba cerrada** (12 testers durante 14 días) antes de publicar en producción. Tu novia y su comunidad son ideales para eso.

## Quitar la barra de direcciones (Digital Asset Links)
Para que la app abra a pantalla completa, sin barra de Chrome, Android verifica que la web te pertenece con un fichero `assetlinks.json` (viene dentro del zip de PWABuilder, con la huella de tu clave). Debe estar en la **raíz del dominio**:

`https://elfen93.github.io/.well-known/assetlinks.json`

Con GitHub Pages esa raíz es el repositorio especial `Elfen93/elfen93.github.io` (no este). Crea ese repositorio, añade la carpeta `.well-known/` con el fichero y un archivo vacío `.nojekyll` en la raíz (si no, GitHub Pages ignora las carpetas que empiezan por punto). Con un dominio propio (recomendable si publicáis la app de verdad) se hace igual en la raíz de ese dominio.

Sin este fichero la app funciona igual, pero muestra una fina barra superior.

## Por qué no un WebView (Capacitor, Cordova)
Google bloquea el inicio de sesión OAuth dentro de WebViews incrustados (`disallowed_useragent`). Con un TWA (lo que genera PWABuilder) la app corre en Chrome de verdad, así que "Entrar con Google" sigue funcionando. Un WebView exigiría reescribir el login con el SDK nativo de Google.

## Después de publicar
- Las actualizaciones de la app (código, contenido) llegan solas al hacer `git push`: la tienda solo se actualiza si cambias el paquete (icono, nombre, permisos).
- En Supabase → Authentication → URL Configuration no hay que cambiar nada: la dirección web sigue siendo la misma.
