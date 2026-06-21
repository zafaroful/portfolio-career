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
import { skillUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const skill = await prisma.skill.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!skill) return apiError("Not found", 404);

    return apiSuccess(skill);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const existing = await prisma.skill.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    const body = validateBody(skillUpdateSchema, await request.json());
    const skill = await prisma.skill.update({
      where: { id },
      data: body,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      tableName: "skills",
      recordId: skill.id,
      metadata: body as Record<string, unknown>,
    });

    return apiSuccess(skill);
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
    const existing = await prisma.skill.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    await prisma.skill.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      tableName: "skills",
      recordId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
