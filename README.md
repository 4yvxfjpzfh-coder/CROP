# Crop

Rescate de comida y excedente agrícola (cacao, café, banano, piña y más).
Sin pagos en línea: se aparta un producto y se recoge en la feria del
agricultor, dentro de una ventana de tiempo limitada.

## Stack

- **Next.js 16** (App Router, Turbopack) + TypeScript + Tailwind CSS v4
- **Auth.js v5** con Sign in with Apple, sesiones JWT
- **Prisma** + **Neon** (PostgreSQL)
- **React Three Fiber** para el catálogo 3D de productos
- **react-konva** para el editor de fotos de producto
- Monorepo con **pnpm workspaces** + **Turborepo**

## Estructura

```
apps/
  web/    → app de cliente + panel de administración (@crop/web)
  api/    → servicio interno: cron de apartados vencidos (@crop/api)
packages/
  prisma/ → schema, migraciones, seed, cliente compartido (@crop/prisma)
  trpc/   → lógica de dominio (routers, servicios) (@crop/trpc)
  shared/ → utilidades compartidas (@crop/shared)
```

Cada app tiene su propio `README.md` con más detalle.

## Arranque local

```bash
pnpm install                # también genera el cliente de Prisma (postinstall)
```

Copiá las plantillas de entorno y completá los valores reales:

- `apps/web/.env.example` → `apps/web/.env.local`
- `apps/api/.env.example` → `apps/api/.env.local`
- `packages/prisma/.env` (ya debería existir con `DATABASE_URL`)

Después:

```bash
cd packages/prisma
.\node_modules\.bin\prisma migrate deploy   # aplica el schema a la DB
.\node_modules\.bin\prisma db seed          # crea los puntos de recogida
cd ../..
pnpm dev                                    # web en :3000, api en :3001
```

Primer login: entrá con Apple en `/signin`, luego corré
`node scripts/make-admin.mjs tu-correo@ejemplo.com` para tener acceso a
`/admin`, y agregá ese correo a `ADMIN_EMAILS`.

Para generar el client secret de Sign in with Apple (JWT desde la clave
`.p8`): `node apps/web/scripts/generate-apple-secret.mjs`.

## Producción

Ver [`DEPLOY.md`](DEPLOY.md).
