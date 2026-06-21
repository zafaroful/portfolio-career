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
import { projectUpdateSchema } from "@/lib/validators";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const existing = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    const body = validateBody(projectUpdateSchema, await request.json());
    const project = await prisma.project.update({
      where: { id },
      data: body,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      tableName: "projects",
      recordId: project.id,
      metadata: body as Record<string, unknown>,
    });

    return apiSuccess(project);
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
    const existing = await prisma.project.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    await prisma.project.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      tableName: "projects",
      recordId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
