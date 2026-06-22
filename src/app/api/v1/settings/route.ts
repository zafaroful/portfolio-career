import { NextRequest } from "next/server";
import type { Session } from "next-auth";
import { prisma } from "@/lib/prisma";
import {
  apiSuccess,
  apiError,
  requireAdmin,
  validateBody,
  handleApiError,
} from "@/lib/api";
import { settingsUpdateSchema } from "@/lib/validators";
import { normalizeExternalUrl } from "@/lib/utils";

const settingsSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  photoUrl: true,
  linkedinUrl: true,
  isPublic: true,
  role: true,
} as const;

async function findSettingsUser(session: Session) {
  const email = session.user.email?.trim();

  if (email) {
    const byEmail = await prisma.user.findUnique({
      where: { email },
      select: settingsSelect,
    });
    if (byEmail) return byEmail;
  }

  if (session.user.id) {
    return prisma.user.findUnique({
      where: { id: session.user.id },
      select: settingsSelect,
    });
  }

  return null;
}

export async function GET() {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const user = await findSettingsUser(session);
    if (!user) return apiError("User not found. Try signing out and back in.", 404);

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await requireAdmin();
    if (!session) return apiError("Unauthorized", 401);

    const existing = await findSettingsUser(session);
    if (!existing) return apiError("User not found. Try signing out and back in.", 404);

    const raw = await request.json();
    if (raw && typeof raw === "object" && "linkedinUrl" in raw) {
      const value = (raw as { linkedinUrl?: string | null }).linkedinUrl;
      (raw as { linkedinUrl?: string | null }).linkedinUrl =
        value == null || value === "" ? null : normalizeExternalUrl(value);
    }

    const body = validateBody(settingsUpdateSchema, raw);

    const user = await prisma.user.update({
      where: { id: existing.id },
      data: body,
      select: {
        id: true,
        name: true,
        email: true,
        bio: true,
        photoUrl: true,
        linkedinUrl: true,
        isPublic: true,
      },
    });

    return apiSuccess(user);
  } catch (error) {
    return handleApiError(error);
  }
}
