import { AuditAction, Prisma } from "@prisma/client";
import { prisma } from "./prisma";

function toJsonMetadata(metadata: Record<string, unknown>): Prisma.InputJsonValue {
  return JSON.parse(
    JSON.stringify(metadata, (_key, value) => {
      if (value instanceof Date) {
        return value.toISOString();
      }
      return value;
    }),
  ) as Prisma.InputJsonValue;
}

export async function createAuditLog(params: {
  userId: string;
  action: AuditAction;
  tableName: string;
  recordId: string;
  metadata?: Record<string, unknown>;
}) {
  return prisma.auditLog.create({
    data: {
      userId: params.userId,
      action: params.action,
      tableName: params.tableName,
      recordId: params.recordId,
      metadata: toJsonMetadata(params.metadata ?? {}),
    },
  });
}
