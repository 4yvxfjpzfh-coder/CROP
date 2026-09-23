# Crop en Google Play (Android)

Mismo enfoque que en iOS (ver `IOS.md`): Crop es una app Next.js con Server
Actions, sesión de Auth.js y acceso directo a Prisma/Postgres — no se puede
empaquetar como HTML/JS estático dentro de la app. La app de Android es una
cáscara nativa (ícono, splash screen, presencia en Google Play) con
[Capacitor](https://capacitorjs.com/) que carga el sitio real por red.

**Crop tiene que estar desplegado (ver `DEPLOY.md`) antes de generar el
build final** — la URL de producción es lo que la app carga.

A diferencia de iOS, **esto sí se puede terminar en Windows** — Android
Studio corre en Windows sin problema, no hace falta Mac.

## Qué ya está hecho (en este repo, hecho en Windows)

- `apps/web/capacitor.config.ts` — la misma configuración que usa iOS
  (`appId: com.crop.app`, `appName: Crop`), compartida entre las dos
  plataformas.
- `apps/web/android/` — proyecto de Android Studio generado
  (`npx cap add android`), con los dos plugins nativos ya enlazados
  automáticamente (Gradle los detecta solo, no hace falta tocar nada a
  mano):
  - `@capacitor/camera` — declara sus propios permisos vía `intent`
    (abre la cámara/galería del sistema, no pide el permiso `CAMERA`
    directo).
  - `@capacitor/local-notifications` — declara `POST_NOTIFICATIONS`,
    `SCHEDULE_EXACT_ALARM`, etc. por su cuenta.
- `apps/web/android/app/src/main/AndroidManifest.xml` — solo tiene el
  permiso `INTERNET` a mano; el resto lo agregan los plugins solos al
  compilar (manifest merging de Gradle), no hace falta editarlo.
- Nombre de la app y package ID ya correctos en
  `android/app/src/main/res/values/strings.xml` (`Crop`, `com.crop.app`).
- Scripts nuevos en `apps/web/package.json`: `pnpm android:sync`,
  `pnpm android:open`.
- Ya sincronizado una vez apuntando a la URL real de producción
  (`https://crop-web-4yvxfjpzfh-coder.vercel.app`).

Todo esto ya está commiteado — alcanza con clonar el repo en cualquier PC.

## Lo que falta

### 1. Preparar la PC

- Instalar [Android Studio](https://developer.android.com/studio) (gratis).
  Al abrirlo la primera vez baja el Android SDK solo.
- Cuenta de [Google Play Console](https://play.google.com/console/) — pago
  único de US$25 (a diferencia de Apple, que cobra US$99 **por año**).

### 2. Clonar y preparar el proyecto

```bash
git clone https://github.com/4yvxfjpzfh-coder/CROP.git
cd CROP
corepack enable
pnpm install
cd apps/web
```

### 3. Apuntar la app a la URL real (si hace falta re-sincronizar)

```bash
CAPACITOR_SERVER_URL=https://crop-web-4yvxfjpzfh-coder.vercel.app pnpm android:sync
```

(Sin esa variable, apunta a `http://localhost:3000` — sirve para probar
contra `pnpm dev` corriendo en la misma PC, pero no para publicar.)

### 4. Abrir en Android Studio

```bash
pnpm android:open   # abre android/ en Android Studio
```

Dentro de Android Studio:

1. Dejá que termine de indexar y bajar dependencias la primera vez (puede
   tardar varios minutos).
2. Elegí un emulador (Android Studio te deja crear uno, ej. "Pixel 8") o
   conectá un celular Android por USB con "Depuración USB" activada, y
   tocá ▶ para probarla.
3. Probá ahí mismo el recordatorio de apartado y la cámara nativa antes de
   seguir.

### 5. Íconos y splash screen

Los de `android/app/src/main/res/mipmap-*/` son placeholders genéricos de
Capacitor — los mismos que hay que reemplazar en iOS. Con
[`@capacitor/assets`](https://github.com/ionic-team/capacitor-assets) un
ícono de 1024×1024 y una imagen de splash generan automáticamente todos los
tamaños para **las dos plataformas a la vez** (Android e iOS), así que
conviene hacerlo una sola vez cuando haya un logo final.

### 6. Firma de la app (clave de release)

Google Play exige que todos los builds de una misma app estén firmados con
la misma clave, para siempre — si se pierde esa clave no hay forma de
publicar más actualizaciones de la misma app, hay que empezar de cero con
un ID nuevo. Android Studio la genera con **Build → Generate Signed Bundle
/ APK → Android App Bundle → Create new…**: pide una contraseña y datos del
certificado.

**Guardá ese archivo `.jks` y la contraseña en un lugar seguro y con
respaldo (no solo en esta PC)** — es la pieza más fácil de perder y la más
cara de perder.

Alternativa recomendada por Google: activar **Play App Signing** en la
consola (Google guarda la clave de subida real, vos solo necesitás una
clave de "upload" que sí se puede resetear si se pierde) — más seguro para
alguien que recién arranca con esto.

### 7. Generar el build de release

**Build → Generate Signed Bundle / APK → Android App Bundle**, firmado con
la clave del paso anterior. Da un archivo `.aab` (Android App Bundle) — es
lo que se sube a Play Console, no el `.apk`.

### 8. Ficha en Google Play Console

Con el `.aab` en mano, en [Play Console](https://play.google.com/console/):

- Crear la app, elegir gratis/paga, país.
- **Data safety form**: qué datos recolecta la app (acá: email para login,
  datos de pedidos) y para qué — hay que ser preciso, Google también revisa
  esto.
- **Cuestionario de clasificación de contenido**.
- Política de privacidad: ya existe en `/privacy` del sitio (mismo texto
  que usa la versión web) — se puede usar esa misma URL de producción.
- Capturas de pantalla (mínimo 2, distintos tamaños según dispositivo),
  ícono de 512×512, gráfico destacado (feature graphic) 1024×500.
- Subir el `.aab` a un track (Internal testing → Closed → Production).

Google generalmente revisa más rápido que Apple, y su política sobre apps
que cargan contenido web es más permisiva que la de Apple (guideline 4.2)
siempre que la app tenga utilidad real y no sea solo un atajo al sitio —
igual conviene tener probadas la cámara y el recordatorio nativo antes de
publicar, por las mismas razones explicadas en `IOS.md`.
