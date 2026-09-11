# @crop/api

Servicio interno de Crop (Next.js 16). Hoy solo expone el endpoint de cron que
libera los apartados vencidos; no tiene interfaz de usuario.

## Endpoints

- `GET /api/cron/release-expired` — requiere `Authorization: Bearer <CRON_SECRET>`.
  Marca como `EXPIRED` las `Order` en `RESERVED` cuyo `pickupBy` ya pasó y
  devuelve el stock de sus `Product` al inventario. Lo dispara
  [`.github/workflows/release-expired-orders.yml`](../../.github/workflows/release-expired-orders.yml)
  cada 15 minutos.

## Desarrollo

```bash
pnpm install        # desde la raíz del monorepo
pnpm --filter api dev
```

Necesita `apps/api/.env.local` — ver [`.env.example`](.env.example).

Ver [`DEPLOY.md`](../../DEPLOY.md) en la raíz del repo para desplegar a producción.
