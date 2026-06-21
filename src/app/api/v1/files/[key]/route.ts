import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import path from "path";
import { apiError } from "@/lib/api";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ key: string }> },
) {
  try {
    const { key } = await params;
    const safeKey = decodeURIComponent(key);
    const localPath = path.join(process.cwd(), "uploads", safeKey);

    const buffer = await readFile(localPath);
    const ext = safeKey.split(".").pop()?.toLowerCase();
    const mimeTypes: Record<string, string> = {
      pdf: "application/pdf",
      jpg: "image/jpeg",
      jpeg: "image/jpeg",
      png: "image/png",
      webp: "image/webp",
      gif: "image/gif",
    };
    const contentType = mimeTypes[ext ?? ""] ?? "application/octet-stream";

    return new NextResponse(buffer, {
      headers: { "Content-Type": contentType },
    });
  } catch {
    return apiError("File not found", 404);
  }
}
