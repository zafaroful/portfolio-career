import type { Metadata } from "next";
import { ErrorBoundary } from "@/components/error-boundary";
import { Providers } from "@/components/providers";
import { Geist, Geist_Mono, Inter, DM_Sans } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";

const dmSansHeading = DM_Sans({subsets:['latin'],variable:'--font-heading'});

const inter = Inter({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Portfolio Career",
  description:
    "Personal portfolio and career management system — skills, certifications, projects, and resumes.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={cn("h-full", "antialiased", geistSans.variable, geistMono.variable, "font-sans", inter.variable, dmSansHeading.variable)}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <ErrorBoundary>{children}</ErrorBoundary>
        </Providers>
      </body>
    </html>
  );
}
