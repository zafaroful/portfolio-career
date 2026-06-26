import { auth } from "@/lib/auth";
import { hasValidSession } from "@/lib/session";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const session = await auth();
  redirect(hasValidSession(session) ? "/dashboard" : "/login");
}
