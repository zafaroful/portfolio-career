import { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  handleApiError,
} from "@/lib/api";
import {
  uploadFile,
  validateFile,
  generateFileKey,
} from "@/lib/r2";

export async function POST(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const formData = await request.formData();
    const file = formData.get("file") as File | null;
    const relatedTable = formData.get("relatedTable") as string | null;
    const relatedId = formData.get("relatedId") as string | null;

    if (!file) return apiError("No file provided", 400);

    validateFile({ type: file.type, size: file.size });

    const buffer = Buffer.from(await file.arrayBuffer());
    const fileKey = generateFileKey(session.user.id, file.name);
    const { fileUrl, fileKey: key } = await uploadFile(
      buffer,
      fileKey,
      file.type,
    );

    let attachment = null;
    if (relatedTable && relatedId) {
      attachment = await prisma.attachment.create({
        data: {
          relatedTable,
          relatedId,
          fileUrl,
          fileKey: key,
          mimeType: file.type,
          size: file.size,
        },
      });
    }

    return apiSuccess({
      fileUrl,
      fileKey: key,
      attachment,
    });
  } catch (error) {
    if (error instanceof Error && error.message.includes("File")) {
      return apiError(error.message, 400);
    }
    return handleApiError(error);
  }
}
