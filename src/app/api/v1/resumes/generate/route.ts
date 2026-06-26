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
import { resumeGenerateSchema } from "@/lib/validators";
import { resumeGenerateWithTailoringSchema } from "@/lib/validators/ai";
import { getOwnerData } from "@/lib/services/portfolio";
import { generateResumePdf, type ResumeRenderOptions } from "@/lib/pdf";
import { uploadFile, generateFileKey } from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const rawBody = await request.json();
    const parsedWithTailoring = resumeGenerateWithTailoringSchema.safeParse(rawBody);
    const body = parsedWithTailoring.success
      ? parsedWithTailoring.data
      : validateBody(resumeGenerateSchema, rawBody);
    const ownerData = await getOwnerData(session.user.id);
    if (!ownerData) return apiError("User not found", 404);

    const tailoringHints: ResumeRenderOptions | undefined =
      parsedWithTailoring.success && parsedWithTailoring.data.tailoringHints
        ? parsedWithTailoring.data.tailoringHints
        : undefined;

    const pdfBuffer = await generateResumePdf(
      {
        user: ownerData,
        skills: ownerData.skills,
        certifications: ownerData.certifications,
        achievements: ownerData.achievements,
        projects: ownerData.projects,
      },
      body.templateId,
      tailoringHints,
    );

    const fileKey = generateFileKey(
      session.user.id,
      `resume-${body.versionName}.pdf`,
    );
    const { fileUrl } = await uploadFile(
      pdfBuffer,
      fileKey,
      "application/pdf",
    );

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        versionName: body.versionName,
        templateId: body.templateId,
        fileUrl,
      },
    });

    await createAuditLog({
      userId: session.user.id,
      action: "CREATE",
      tableName: "resumes",
      recordId: resume.id,
      metadata: {
        versionName: body.versionName,
        templateId: body.templateId,
        ...("jobDescription" in body && body.jobDescription
          ? { hasJobDescription: true }
          : {}),
        ...(tailoringHints ? { tailored: true } : {}),
      },
    });

    return apiSuccess(resume);
  } catch (error) {
    return handleApiError(error);
  }
}
