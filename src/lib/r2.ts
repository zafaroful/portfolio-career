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

export const MAX_FILE_SIZE = 10 * 1024 * 1024;

export function validateFile(file: { type: string; size: number }) {
  if (!ALLOWED_MIME_TYPES.includes(file.type as typeof ALLOWED_MIME_TYPES[number])) {
    throw new Error("File type not allowed");
  }
  if (file.size > MAX_FILE_SIZE) {
    throw new Error("File exceeds maximum size of 10MB");
  }
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
