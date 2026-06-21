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
import { projectCreateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const projects = await prisma.project.findMany({
      where: { userId: session.user.id },
      orderBy: { startDate: "desc" },
    });

    return apiSuccess(projects, { total: projects.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const body = validateBody(projectCreateSchema, await request.json());
    const project = await prisma.project.create({
      data: { ...body, userId: session.user.id },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      tableName: "projects",
      recordId: project.id,
    });

    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error);
  }
}
