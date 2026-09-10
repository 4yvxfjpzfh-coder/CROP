import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { releaseExpiredOrders } from "@meguru/trpc/src/service/orders";

// Prisma necesita el runtime de Node, y la ruta nunca debe cachearse.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function isAuthorized(header: string | null, secret: string): boolean {
  if (!header) {
    return false;
  }

  const expected = Buffer.from(`Bearer ${secret}`);
  const received = Buffer.from(header);

  // timingSafeEqual exige buffers del mismo largo.
  if (expected.length !== received.length) {
    return false;
  }

  return timingSafeEqual(expected, received);
}

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;

  if (!secret) {
    // Sin secreto configurado el endpoint quedaría abierto a cualquiera.
    return NextResponse.json(
      { error: "CRON_SECRET no está configurado" },
      { status: 500 }
    );
  }

  if (!isAuthorized(request.headers.get("authorization"), secret)) {
    return NextResponse.json({ error: "No autorizado" }, { status: 401 });
  }

  const startedAt = Date.now();
  const result = await releaseExpiredOrders();

  return NextResponse.json({ ...result, tookMs: Date.now() - startedAt });
}
