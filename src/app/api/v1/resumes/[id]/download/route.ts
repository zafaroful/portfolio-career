import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin, handleApiError } from "@/lib/api";
import { getFileExtension, getMimeTypeFromExtension } from "@/lib/r2";
import { readFile } from "fs/promises";
import path from "path";

function getResumeDownloadMeta(resume: {
  versionName: string;
  templateId: string;
  fileUrl: string;
}) {
  const urlExt = getFileExtension(resume.fileUrl.split("?")[0] ?? "");
  const ext = urlExt ?? (resume.templateId === "uploaded" ? "pdf" : "pdf");
  const safeName = resume.versionName.replace(/[^a-zA-Z0-9._-]/g, "_");
  return {
    ext,
    mimeType: getMimeTypeFromExtension(ext),
    filename: `${safeName}.${ext}`,
  };
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const { id } = await params;
    const resume = await prisma.resume.findFirst({
      where: { id, userId: session.user.id },
    });
    if (!resume?.fileUrl) return apiError("Not found", 404);

    const { mimeType, filename } = getResumeDownloadMeta({
      versionName: resume.versionName,
      templateId: resume.templateId,
      fileUrl: resume.fileUrl,
    });

    if (resume.fileUrl.startsWith("/api/v1/files/")) {
      const key = decodeURIComponent(
        resume.fileUrl.replace("/api/v1/files/", ""),
      );
      const localPath = path.join(process.cwd(), "uploads", key);
      const buffer = await readFile(localPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.redirect(resume.fileUrl);
  } catch (error) {
    return handleApiError(error);
  }
}
