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
  achievementCreateSchema,
} from "@/lib/validators";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const achievements = await prisma.achievement.findMany({
      where: { userId: session.user.id },
      orderBy: { date: "desc" },
    });

    return apiSuccess(achievements, { total: achievements.length });
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const body = validateBody(achievementCreateSchema, await request.json());
    const achievement = await prisma.achievement.create({
      data: { ...body, userId: session.user.id },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      tableName: "achievements",
      recordId: achievement.id,
    });

    return apiSuccess(achievement);
  } catch (error) {
    return handleApiError(error);
  }
}
