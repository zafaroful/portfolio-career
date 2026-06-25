import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiError, requireAdmin, handleApiError } from "@/lib/api";
import { getFileExtension, getMimeTypeFromExtension } from "@/lib/r2";
import { readFile } from "fs/promises";
import path from "path";

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

    const urlExt = getFileExtension(resume.fileUrl.split("?")[0] ?? "");
    const ext = urlExt ?? "pdf";
    const mimeType = getMimeTypeFromExtension(ext);

    // Handle local files
    if (resume.fileUrl.startsWith("/api/v1/files/")) {
      const key = decodeURIComponent(
        resume.fileUrl.replace("/api/v1/files/", ""),
      );
      const localPath = path.join(process.cwd(), "uploads", key);
      const buffer = await readFile(localPath);
      return new NextResponse(buffer, {
        headers: {
          "Content-Type": mimeType,
          "Content-Disposition": `inline; filename="${resume.versionName}.${ext}"`,
        },
      });
    }

    // For remote files (R2), redirect with inline disposition
    return NextResponse.redirect(resume.fileUrl);
  } catch (error) {
    return handleApiError(error);
  }
}
