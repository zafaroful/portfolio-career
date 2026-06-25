import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  validateBody,
  handleApiError,
} from "@/lib/api";
import { computeOnboardingState } from "@/lib/onboarding";
import { z } from "zod";

const onboardingUpdateSchema = z.object({
  dismiss: z.boolean().optional(),
});

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        onboardingCompleted: true,
        onboardingStep: true,
        isPublic: true,
        portfolioSlug: true,
        _count: {
          select: {
            skills: true,
            certifications: true,
            achievements: true,
            projects: true,
            resumes: true,
          },
        },
      },
    });

    if (!user) return apiError("User not found", 404);

    const onboarding = computeOnboardingState({
      counts: {
        skills: user._count.skills,
        certifications: user._count.certifications,
        achievements: user._count.achievements,
        projects: user._count.projects,
        resumes: user._count.resumes,
      },
      isPublic: user.isPublic,
      portfolioSlug: user.portfolioSlug,
      onboardingCompleted: user.onboardingCompleted,
      onboardingStep: user.onboardingStep,
    });

    return apiSuccess(onboarding);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const body = validateBody(onboardingUpdateSchema, await request.json());

    if (body.dismiss) {
      await prisma.user.update({
        where: { id: session.user.id },
        data: { onboardingCompleted: true },
      });
    }

    return apiSuccess({ dismissed: true });
  } catch (error) {
    return handleApiError(error);
  }
}
