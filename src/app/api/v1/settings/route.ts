import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  validateBody,
  handleApiError,
} from "@/lib/api";
import { settingsUpdateSchema } from "@/lib/validators";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        photoUrl: true,
        portfolioSlug: true,
        isPublic: true,
        role: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const body = validateBody(settingsUpdateSchema, await request.json());

    if (body.portfolioSlug) {
      const existing = await prisma.user.findFirst({
        where: {
          portfolioSlug: body.portfolioSlug,
          NOT: { id: session.user.id },
        },
      });
      if (existing) return apiError("Portfolio slug already taken", 409);
    }

    const user = await prisma.user.update({
      where: { id: session.user.id },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        photoUrl: true,
        portfolioSlug: true,
        isPublic: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
