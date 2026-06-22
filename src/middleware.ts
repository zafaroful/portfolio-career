import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth.config";
import { protectedRoutes } from "@/lib/nav-config";
import { NextResponse } from "next/server";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isProtected = protectedRoutes.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !isLoggedIn) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname === "/login" && isLoggedIn) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/skills/:path*",
    "/certifications/:path*",
    "/achievements/:path*",
    "/projects/:path*",
    "/resumes/:path*",
    "/settings/:path*",
    "/design-system/:path*",
    "/login",
  ],
};
