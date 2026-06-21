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
import { certificationUpdateSchema } from "@/lib/validators";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const certification = await prisma.certification.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!certification) return apiError("Not found", 404);

    return apiSuccess(certification);
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
    const existing = await prisma.certification.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    const body = validateBody(certificationUpdateSchema, await request.json());
    const certification = await prisma.certification.update({
      where: { id },
      data: body,
    });

    await createAuditLog({
      userId: session.user.id,
      action: "UPDATE",
      tableName: "certifications",
      recordId: certification.id,
      metadata: body as Record<string, unknown>,
    });

    return apiSuccess(certification);
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
    const existing = await prisma.certification.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!existing) return apiError("Not found", 404);

    await prisma.certification.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      tableName: "certifications",
      recordId: id,
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
