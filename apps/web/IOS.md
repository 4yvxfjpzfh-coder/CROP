# Crop en el App Store (iOS)

Crop es una app Next.js con Server Actions, sesión de Auth.js y acceso
directo a Prisma/Postgres — nada de eso puede correr empaquetado dentro de
un WebView sin backend. Por eso la app de iOS no es una copia estática del
sitio: es una cáscara nativa (ícono, splash screen, presencia en el App
Store) que carga el sitio real por red, con [Capacitor](https://capacitorjs.com/).

**Esto significa que Crop tiene que estar desplegado (ver `DEPLOY.md`) antes
de mandar la app a revisión de Apple** — la URL de producción es lo que la
app de iOS carga.

## Qué ya está hecho (en este repo, hecho en Windows)

- `apps/web/capacitor.config.ts` — configuración de Capacitor.
- `apps/web/ios/` — proyecto Xcode generado (`App.xcodeproj`). Usa Swift
  Package Manager para las dependencias nativas de Capacitor (no
  CocoaPods), así que **no hace falta instalar CocoaPods/Ruby en la Mac**.
- Scripts nuevos en `apps/web/package.json`: `pnpm ios:sync`, `pnpm ios:open`.

Todo esto ya está commiteado — en la Mac alcanza con clonar el repo.

## Lo que falta (solo se puede hacer en una Mac con Xcode)

### 1. Preparar la Mac

- Instalar [Xcode](https://apps.apple.com/app/xcode/id497799835) desde la
  App Store (gratis, pero pesado — varios GB).
- Tener una cuenta de [Apple Developer Program](https://developer.apple.com/programs/)
  paga (US$99/año) — **obligatoria** para subir algo al App Store, aparte
  de las credenciales de "Sign in with Apple" que ya usa la app para login.

### 2. Clonar y preparar el proyecto

```bash
git clone https://github.com/4yvxfjpzfh-coder/CROP.git
cd CROP
corepack enable
pnpm install
cd apps/web
```

### 3. Apuntar la app a la URL real

Antes de compilar para enviar a revisión, editá `capacitor.config.ts` (o
seteá la variable de entorno `CAPACITOR_SERVER_URL`) con la URL de
producción de Vercel, por ejemplo:

```bash
CAPACITOR_SERVER_URL=https://crop-web.vercel.app pnpm ios:sync
```

(Sin esa variable, apunta a `http://localhost:3000` — sirve para probar en
el Simulator con `pnpm dev` corriendo en la misma Mac, pero no para enviar
a Apple.)

### 4. Abrir en Xcode

```bash
pnpm ios:sync   # copia la config + resuelve paquetes de Capacitor
pnpm ios:open   # abre ios/App/App.xcodeproj en Xcode
```

Dentro de Xcode:

1. Seleccioná el proyecto **App** → pestaña **Signing & Capabilities** →
   elegí tu equipo de Apple Developer en **Team**. Xcode genera el
   certificado y el provisioning profile solo.
2. Elegí un simulador (ej. "iPhone 16") arriba y tocá ▶ para probarla.
3. Para un dispositivo físico o para subir al App Store: **Product → Archive**,
   y desde el Organizer usás **Distribute App**.

### 5. Íconos y splash screen

Los de `ios/App/App/Assets.xcassets/` son placeholders genéricos de
Capacitor. Antes de mandar a revisión hay que reemplazarlos por el logo
real de Crop — la forma más simple es con
[`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets):
generás un ícono de 1024×1024 y una imagen de splash, y el paquete arma
todos los tamaños automáticamente.

### 6. Apple Sign In dentro de la app nativa

Como Crop ya usa "Sign in with Apple" vía Auth.js en el navegador, el login
va a funcionar igual dentro del WebView de Capacitor sin cambios — pero
Apple exige que las apps nativas que ofrecen login social también ofrezcan
Sign in with Apple *nativo* (no solo el botón web) si usan otros logins
sociales. Como Crop solo usa Apple, no hace falta nada nativo adicional
para esa regla — igual conviene revisar la
[guía de revisión 4.8](https://developer.apple.com/app-store/review/guidelines/#sign-in-with-apple)
antes de enviar.

### 7. Riesgo de rechazo: "app que es solo un sitio web"

Las guías de revisión de Apple (sección 4.2, "Minimum Functionality")
rechazan apps que son solo una página web repackagada sin funcionalidad
nativa real. **No hay forma de garantizar al 100% que Apple la apruebe** —
la decisión final es de una persona revisando a mano — pero se agregaron
capacidades nativas reales (no solo el sitio en un WebView) para reducir
el riesgo en serio, todas ya en el código (`apps/web/lib/native.ts`):

- **Recordatorio local antes de que venza un apartado** (2 horas antes,
  `@capacitor/local-notifications`): algo que un sitio web no puede hacer
  de forma confiable. Se programa solo al apartar, y se cancela solo si
  se cancela el apartado.
- **Cámara nativa para fotos de producto** (`@capacitor/camera`): en la
  app, junto al botón "Subir foto" del admin/agricultor aparece "Tomar
  foto", que abre la cámara o galería nativa de iOS en vez de (o además
  de) el selector de archivos del navegador — útil de verdad para un
  agricultor sacando la foto del producto ahí mismo en la feria. El
  selector de archivos sigue disponible como respaldo si la cámara nativa
  falla o el permiso fue denegado.

Están activas y probadas en la versión web (no rompen nada ahí — son
no-ops fuera de la app nativa); falta probarlas *dentro* de la app en la
Mac, con un dispositivo o el Simulator, antes de enviar a revisión. Los
permisos de cámara/galería (`NSCameraUsageDescription`,
`NSPhotoLibraryUsageDescription`) y la excepción de red local para
pruebas con `CAPACITOR_SERVER_URL` apuntando a la Mac
(`NSAllowsLocalNetworking`) ya están en `Info.plist`.

Si aun así Apple la rechaza por esto en la primera vuelta, el siguiente
paso sería notificaciones push reales (no solo locales) o evaluar un
rewrite parcial en React Native/Swift — pero recién tendría sentido
evaluarlo si el rechazo efectivamente ocurre.
