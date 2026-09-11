# Desplegar Crop

Monorepo con dos apps Next.js independientes (`apps/web`, `apps/api`) + un
paquete Prisma compartido (`packages/prisma`). Se despliegan como **dos
proyectos separados en Vercel**, apuntando al mismo repo de GitHub.

## 0. Antes de empezar

- [ ] Repo en GitHub (push hecho).
- [ ] Las 3 migraciones aplicadas contra Neon: `cd packages/prisma && .\node_modules\.bin\prisma migrate deploy`
- [ ] Seed corrido: `.\node_modules\.bin\prisma db seed`
- [ ] Al menos un login de prueba hecho + tu cuenta promovida a ADMIN (`node scripts/make-admin.mjs <correo>`)

## 1. Proyecto Vercel: `crop-web` (apps/web)

**New Project → Import** el repo → en "Root Directory" elegí `apps/web`.
Vercel detecta Next.js automáticamente; el comando de build (`next build`) y el
`postinstall` del monorepo (`prisma generate`) corren solos porque Vercel
instala desde la raíz cuando detecta el workspace de pnpm.

Variables de entorno (Settings → Environment Variables), mismas que
`apps/web/.env.example`:

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La cadena de Neon (misma de `packages/prisma/.env`) |
| `AUTH_SECRET` | Uno nuevo para producción — **no reuses el de dev**. Generalo con `npx auth secret` |
| `AUTH_URL` | `https://tu-dominio.vercel.app` (o tu dominio propio) |
| `AUTH_APPLE_ID` | El Services ID de Apple |
| `AUTH_APPLE_SECRET` | JWT generado con `node apps/web/scripts/generate-apple-secret.mjs` |
| `ADMIN_EMAILS` | Tu correo (y los que corresponda), separados por coma |
| `BLOB_READ_WRITE_TOKEN` | Ver paso 2 |

## 2. Vercel Blob (fotos de producto)

Storage → Create Database → **Blob** → conectalo al proyecto `crop-web`.
Vercel inyecta `BLOB_READ_WRITE_TOKEN` automáticamente; no hace falta pegarlo
a mano si lo conectás desde ahí.

## 3. Apple: agregar el dominio de producción

En developer.apple.com, en el **Services ID** que ya creaste:

- **Domains**: agregá tu dominio de producción (sin `https://`), ej. `crop-web.vercel.app`
- **Return URLs**: agregá `https://tu-dominio.vercel.app/api/auth/callback/apple`

Podés tener ahí mismo tanto la URL de localhost (para seguir developando) como
la de producción — Apple permite varias.

## 4. Proyecto Vercel: `crop-api` (apps/api)

Otro **New Project → Import** del mismo repo → "Root Directory": `apps/api`.

Variables de entorno (`apps/api/.env.example`):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | La misma cadena de Neon |
| `CRON_SECRET` | Un secreto nuevo (`openssl rand -base64 32` o similar) — **no reuses el de dev** |

Anotá la URL que te da Vercel para este proyecto, vas a necesitarla ahora:
`https://crop-api.vercel.app/api/cron/release-expired`.

## 5. GitHub Actions: activar el cron

El workflow `.github/workflows/release-expired-orders.yml` ya está en el repo
y corre cada 15 minutos, pero necesita dos **repository secrets** (GitHub →
Settings → Secrets and variables → Actions → New repository secret):

| Secret | Valor |
|---|---|
| `RELEASE_EXPIRED_URL` | `https://crop-api.vercel.app/api/cron/release-expired` (la URL del paso 4) |
| `CRON_SECRET` | El mismo valor que pusiste en las env vars de `crop-api` |

Podés probarlo a mano desde la pestaña **Actions** del repo → el workflow →
"Run workflow", sin esperar los 15 minutos.

## 6. Checklist post-deploy

- [ ] `https://tu-dominio/` carga
- [ ] "Entrar" → Apple → consentimiento → landing en `/`
- [ ] `/admin/products` accesible con tu cuenta admin, `/admin/products` para otra cuenta redirige a `/`
- [ ] Subís una foto real desde `/admin/products`, la agregás a `/admin/catalogo`
- [ ] `/catalogo` la muestra en 3D
- [ ] "Apartar" crea el registro en `/mis-apartados`
- [ ] Corrés el workflow de GitHub Actions a mano una vez y confirmás 200 en los logs

## Notas

- Los dos proyectos comparten la misma base de Neon; no hace falta una DB
  separada por entorno para el piloto.
- Si más adelante querés un entorno de *staging* separado, la forma más simple
  es una segunda base en Neon (tienen un plan gratuito con varias) + un tercer
  par de proyectos Vercel apuntando a una rama distinta.
