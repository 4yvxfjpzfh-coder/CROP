import { prisma } from "@crop/prisma";
import type { AdminAuditAction, Prisma } from "@crop/prisma";
import type { AdminActor } from "./admin-guard";

/**
 * Registra una entrada en AdminAuditLog: quién, qué acción, sobre qué entidad,
 * cuándo. Se llama desde cada acción de escritura de producto del panel.
 *
 * `actorEmail` se guarda como snapshot para que el registro siga siendo
 * legible aunque después se elimine la cuenta del administrador.
 */
export async function recordAdminAudit(params: {
  actor: AdminActor;
  action: AdminAuditAction;
  entityType: string;
  entityId?: string;
  summary?: string;
  metadata?: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.adminAuditLog.create({
    data: {
      actorId: params.actor.id,
      actorEmail: params.actor.email,
      action: params.action,
      entityType: params.entityType,
      entityId: params.entityId,
      summary: params.summary,
      metadata: params.metadata,
    },
  });
}
