import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  validateBody,
  handleApiError,
} from "@/lib/api";
import { createAuditLog } from "@/lib/audit";
import { achievementUpdateSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const existing = await prisma.achievement.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    const body = validateBody(achievementUpdateSchema, await request.json());
    const achievement = await prisma.achievement.update({
      where: { id },
      data: body,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      tableName: "achievements",
      recordId: achievement.id,
      metadata: body as Record<string, unknown>,
    });

    return apiSuccess(achievement);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const existing = await prisma.achievement.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    await prisma.achievement.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      tableName: "achievements",
      recordId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
