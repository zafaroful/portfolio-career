"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { FormField } from "@/components/common/form-field";
import { AuthLayout } from "@/components/layout/auth-layout";
import { toast } from "sonner";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [resetUrl, setResetUrl] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.error(data.error || "Something went wrong");
        return;
      }

      toast.success("Password reset link sent to your email");
      
      // In development, show the reset URL
      if (data.resetUrl) {
        setResetUrl(data.resetUrl);
      }
    } catch (error) {
      toast.error("Failed to send reset link");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthLayout>
      <Card className="w-full max-w-md shadow-elevation-md">
        <CardHeader>
          <CardTitle>Forgot Password</CardTitle>
          <CardDescription>
            Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                placeholder="your.email@example.com"
              />
            </FormField>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? "Sending..." : "Send Reset Link"}
            </Button>

            {resetUrl && (
              <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                <p className="text-sm text-yellow-800 font-medium mb-2">
                  Development Mode: Reset Link
                </p>
                <a
                  href={resetUrl}
                  className="text-sm text-blue-600 hover:underline break-all"
                >
                  {resetUrl}
                </a>
              </div>
            )}

            <div className="text-center mt-4">
              <Link
                href="/login"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                Back to login
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </AuthLayout>
  );
}
