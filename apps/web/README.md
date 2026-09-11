# @crop/web

App de cliente + panel de administración de Crop (Next.js 16, App Router).

## Desarrollo

```bash
pnpm install        # desde la raíz del monorepo
pnpm --filter web dev
```

Necesita `apps/web/.env.local` — ver [`.env.example`](.env.example) y la guía
de arranque en el `README.md` de la raíz del repo.

## Estructura

- `app/(store)/catalogo/` — catálogo 3D (React Three Fiber) + apartado de productos
- `app/(admin)/admin/` — panel de administración (productos, curaduría del catálogo, auditoría)
- `app/perfil/`, `app/welcome/`, `app/signin/` — cuenta, consentimiento y login (Sign in with Apple)
- `components/photo-editor/` — editor de fotos de producto (react-konva)
- `auth.ts` / `auth.config.ts` — Auth.js v5; el `.config` es la versión sin Prisma que usa `proxy.ts` en edge
- `lib/admin-guard.ts` — verificación autoritativa de rol admin (server-side)

Ver [`DEPLOY.md`](../../DEPLOY.md) en la raíz del repo para desplegar a producción.
