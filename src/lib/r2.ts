import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { writeFile, mkdir, readFile } from "fs/promises";
import path from "path";

const UPLOAD_DIR = path.join(process.cwd(), "uploads");

function isR2Configured() {
  return !!(
    process.env.R2_ACCOUNT_ID &&
    process.env.R2_ACCESS_KEY_ID &&
    process.env.R2_SECRET_ACCESS_KEY &&
    process.env.R2_BUCKET_NAME &&
    process.env.R2_ENDPOINT
  );
}

function getS3Client() {
  return new S3Client({
    region: "auto",
    endpoint: process.env.R2_ENDPOINT,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID!,
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY!,
    },
  });
}

export const ALLOWED_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const RESUME_MIME_TYPES = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

const EXTENSION_MIME_TYPES: Record<string, string> = {
  pdf: "application/pdf",
  doc: "application/msword",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
};

export function validateFile(file: { type: string; size: number }) {
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    throw new Error("File type not allowed");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds maximum size of 10MB");
  }
}

export function validateResumeFile(file: {
  type: string;
  size: number;
  name?: string;
}) {
  const ext = file.name ? getFileExtension(file.name) : null;
  const allowedByExt = ext === "pdf" || ext === "doc" || ext === "docx";
  const allowedByMime = RESUME_MIME_TYPES.includes(
    file.type as (typeof RESUME_MIME_TYPES)[number],
  );

  if (!allowedByMime && !allowedByExt) {
    throw new Error("Resume must be a PDF, DOC, or DOCX file");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds maximum size of 10MB");
  }
}

export function resolveResumeMimeType(filename: string, type: string): string {
  if (type && RESUME_MIME_TYPES.includes(type as (typeof RESUME_MIME_TYPES)[number])) {
    return type;
  }
  const ext = getFileExtension(filename);
  if (ext && EXTENSION_MIME_TYPES[ext]) {
    return EXTENSION_MIME_TYPES[ext];
  }
  return type || "application/octet-stream";
}

export function getFileExtension(filename: string): string | null {
  const match = filename.match(/\.([a-z0-9]+)$/i);
  return match?.[1]?.toLowerCase() ?? null;
}

export function getMimeTypeFromExtension(ext: string): string {
  return EXTENSION_MIME_TYPES[ext] ?? "application/octet-stream";
}

export async function uploadFile(
  buffer: Buffer,
  key: string,
  mimeType: string,
): Promise<{ fileUrl: string; fileKey: string }> {
  if (isR2Configured()) {
    const client = getS3Client();
    await client.send(
      new PutObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: key,
        Body: buffer,
        ContentType: mimeType,
      }),
    );
    const publicUrl = process.env.R2_PUBLIC_URL
      ? `${process.env.R2_PUBLIC_URL}/${key}`
      : key;
    return { fileUrl: publicUrl, fileKey: key };
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  const localPath = path.join(UPLOAD_DIR, key.replace(/\//g, "_"));
  await writeFile(localPath, buffer);
  const fileUrl = `/api/v1/files/${encodeURIComponent(key.replace(/\//g, "_"))}`;
  return { fileUrl, fileKey: key };
}

export async function getSignedFileUrl(fileKey: string): Promise<string> {
  if (isR2Configured()) {
    const client = getS3Client();
    return getSignedUrl(
      client,
      new GetObjectCommand({
        Bucket: process.env.R2_BUCKET_NAME!,
        Key: fileKey,
      }),
      { expiresIn: 3600 },
    );
  }
  const localPath = path.join(UPLOAD_DIR, fileKey.replace(/\//g, "_"));
  const buffer = await readFile(localPath);
  return `data:application/octet-stream;base64,${buffer.toString("base64")}`;
}

export function generateFileKey(userId: string, filename: string) {
  const safeName = filename.replace(/[^a-zA-Z0-9.-]/g, "_");
  return `${userId}/${Date.now()}-${safeName}`;
}
