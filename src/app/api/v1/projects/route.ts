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
import { projectCreateSchema, projectStatusSchema } from "@/lib/validators";
import { z } from "zod";

const projectListQuerySchema = z.object({
  status: projectStatusSchema.optional(),
  category: z.string().optional(),
  tag: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { searchParams } = new URL(request.url);
    const query = projectListQuerySchema.parse({
      status: searchParams.get("status") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      tag: searchParams.get("tag") ?? undefined,
    });

    const where: {
      userId: string;
      status?: (typeof query)["status"];
      category?: string;
      tags?: { has: string };
    } = { userId: session.user.id };

    if (query.status) where.status = query.status;
    if (query.category) where.category = query.category;
    if (query.tag) where.tags = { has: query.tag };

    const projects = await prisma.project.findMany({
      where,
      orderBy: { startDate: "desc" },
    });

    const categories = await prisma.project.findMany({
      where: { userId: session.user.id, category: { not: null } },
      select: { category: true },
      distinct: ["category"],
    });

    const allProjects = await prisma.project.findMany({
      where: { userId: session.user.id },
      select: { tags: true },
    });
    const tags = [...new Set(allProjects.flatMap((p) => p.tags))].sort();

    return apiSuccess(projects, {
      total: projects.length,
      filters: {
        categories: categories.map((c) => c.category).filter(Boolean) as string[],
        tags,
      },
    });
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
      metadata: { recordName: project.title },
    });

    return apiSuccess(project);
  } catch (error) {
    return handleApiError(error);
  }
}
