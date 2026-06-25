import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { apiSuccess, apiError, requireAdmin, handleApiError } from "@/lib/api";
import { createAuditLog } from "@/lib/audit";
import { unlink } from "fs/promises";
import path from "path";

async function deleteLocalFile(fileUrl: string) {
  if (!fileUrl.startsWith("/api/v1/files/")) return;

  const key = decodeURIComponent(fileUrl.replace("/api/v1/files/", ""));
  const localPath = path.join(process.cwd(), "uploads", key);
  try {
    await unlink(localPath);
  } catch {
    // File may already be missing; ignore
  }
}

export async function DELETE(
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
    if (!resume) return apiError("Not found", 404);

    if (resume.fileUrl) {
      await deleteLocalFile(resume.fileUrl);
    }

    await prisma.resume.delete({ where: { id } });

    await createAuditLog({
      userId: session.user.id,
      action: "DELETE",
      tableName: "resumes",
      recordId: id,
      metadata: { recordName: resume.versionName },
    });

    return apiSuccess({ deleted: true });
  } catch (error) {
    return handleApiError(error);
  }
}
