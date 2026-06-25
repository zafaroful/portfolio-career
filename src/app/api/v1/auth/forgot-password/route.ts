import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { randomBytes } from "crypto";

const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email } = forgotPasswordSchema.parse(body);

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success even if user doesn't exist (security best practice)
    if (!user) {
      return NextResponse.json(
        { message: "If an account exists with this email, you will receive a password reset link." },
        { status: 200 }
      );
    }

    // Generate reset token
    const resetToken = randomBytes(32).toString("hex");
    const resetExpiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour from now

    // Save token to database
    await prisma.user.update({
      where: { email },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpiry: resetExpiry,
      },
    });

    // TODO: Send email with reset link
    // For now, we'll log it (in production, integrate with email service)
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${resetToken}`;
    console.log(`Password reset link for ${email}: ${resetUrl}`);

    // In development, return the token (remove in production)
    if (process.env.NODE_ENV === "development") {
      return NextResponse.json(
        {
          message: "Password reset link sent to your email.",
          resetUrl, // Only for development
        },
        { status: 200 }
      );
    }

    return NextResponse.json(
      { message: "If an account exists with this email, you will receive a password reset link." },
      { status: 200 }
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 });
    }

    console.error("Forgot password error:", error);
    return NextResponse.json({ error: "Something went wrong" }, { status: 500 });
  }
}
