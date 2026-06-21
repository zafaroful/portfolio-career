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
import {
  certificationCreateSchema,
} from "@/lib/validators";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const certifications = await prisma.certification.findMany({
      where: { userId: session.user.id },
      orderBy: { issueDate: "desc" },
    });

    return apiSuccess(certifications, { total: certifications.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const body = validateBody(certificationCreateSchema, await request.json());
    const certification = await prisma.certification.create({
      data: { ...body, userId: session.user.id },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      tableName: "certifications",
      recordId: certification.id,
    });

    return apiSuccess(certification);
  } catch (error) {
    return handleApiError(error);
  }
}
