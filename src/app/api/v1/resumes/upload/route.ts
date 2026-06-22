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
import { resumeUploadSchema } from "@/lib/validators";
import {
  uploadFile,
  generateFileKey,
  validateResumeFile,
  resolveResumeMimeType,
} from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const versionName = formData.get("versionName") as string | null;

    if (!file) return apiError("No file provided", 400);

    const resolvedVersionName =
      (typeof versionName === "string" ? versionName.trim() : "") ||
      file.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " ").trim() ||
      "Uploaded resume";

    const body = validateBody(resumeUploadSchema, { versionName: resolvedVersionName });
    validateResumeFile({ type: file.type, size: file.size, name: file.name });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = generateFileKey(session.user.id, file.name);
    const mimeType = resolveResumeMimeType(file.name, file.type);
    const { fileUrl } = await uploadFile(buffer, fileKey, mimeType);

    const resume = await prisma.resume.create({
      data: {
        userId: session.user.id,
        versionName: body.versionName,
        templateId: "uploaded",
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
        templateId: "uploaded",
        originalFilename: file.name,
      },
    });

    return apiSuccess(resume);
  } catch (error) {
    if (error instanceof Error && error.message.includes("File")) {
      return apiError(error.message, 400);
    }
    return handleApiError(error);
  }
}
