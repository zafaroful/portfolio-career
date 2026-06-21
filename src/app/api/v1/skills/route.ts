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
  skillCreateSchema,
} from "@/lib/validators";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const skills = await prisma.skill.findMany({
      where: { userId: session.user.id },
      orderBy: [{ category: "asc" }, { name: "asc" }],
    });

    return apiSuccess(skills, { total: skills.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const body = validateBody(skillCreateSchema, await request.json());
    const skill = await prisma.skill.create({
      data: { ...body, userId: session.user.id },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      tableName: "skills",
      recordId: skill.id,
    });

    return apiSuccess(skill);
  } catch (error) {
    return handleApiError(error);
  }
}
