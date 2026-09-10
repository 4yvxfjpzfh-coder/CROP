import { initTRPC } from "@trpc/server";
import { orderRouter } from "./src/router/order";

const t = initTRPC.create();

export const router = t.router;
export const publicProcedure = t.procedure;

export const appRouter = router({
  order: orderRouter,
});

export type AppRouter = typeof appRouter;



