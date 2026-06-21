import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  handleApiError,
} from "@/lib/api";

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const resumes = await prisma.resume.findMany({
      where: { userId: session.user.id },
      orderBy: { generatedAt: "desc" },
    });

    return apiSuccess(resumes, { total: resumes.length });
  } catch (error) {
    return handleApiError(error);
  }
}
