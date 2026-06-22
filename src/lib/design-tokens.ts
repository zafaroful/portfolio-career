/**
 * Design system tokens — reference values for documentation and programmatic use.
 * CSS variables in globals.css are the source of truth for styling.
 */

export const brandColors = {
  primary: "var(--primary)",
  secondary: "var(--secondary)",
  accent: "var(--accent)",
  brand: "var(--brand)",
  destructive: "var(--destructive)",
  success: "var(--success)",
  warning: "var(--warning)",
  info: "var(--info)",
  muted: "var(--muted)",
  background: "var(--background)",
  foreground: "var(--foreground)",
} as const;

export const typographyScale = [
  { name: "Display", className: "text-display", sample: "Portfolio Career" },
  { name: "Heading 1", className: "text-2xl font-bold tracking-tight", sample: "Page title" },
  { name: "Heading 2", className: "text-xl font-semibold tracking-tight", sample: "Section title" },
  { name: "Heading 3", className: "text-lg font-semibold", sample: "Subsection" },
  { name: "Lead", className: "text-lead", sample: "Supporting description text" },
  { name: "Body", className: "text-sm", sample: "Default body copy for forms and tables." },
  { name: "Caption", className: "text-caption", sample: "Metadata and helper text" },
  { name: "Code", className: "font-mono text-sm", sample: "const slug = 'admin'" },
] as const;

export const spacingScale = [
  { name: "xs", value: "0.25rem", tailwind: "1" },
  { name: "sm", value: "0.5rem", tailwind: "2" },
  { name: "md", value: "0.75rem", tailwind: "3" },
  { name: "base", value: "1rem", tailwind: "4" },
  { name: "lg", value: "1.5rem", tailwind: "6" },
  { name: "xl", value: "2rem", tailwind: "8" },
  { name: "2xl", value: "3rem", tailwind: "12" },
  { name: "3xl", value: "4rem", tailwind: "16" },
] as const;

export const radiusScale = [
  { name: "sm", css: "var(--radius-sm)" },
  { name: "md", css: "var(--radius-md)" },
  { name: "lg", css: "var(--radius-lg)" },
  { name: "xl", css: "var(--radius-xl)" },
] as const;

export const semanticColors = [
  { name: "Primary", token: "--primary", description: "Primary actions and active nav" },
  { name: "Secondary", token: "--secondary", description: "Secondary surfaces and badges" },
  { name: "Accent", token: "--accent", description: "Highlighted areas and hover states" },
  { name: "Success", token: "--success", description: "Valid states and confirmations" },
  { name: "Warning", token: "--warning", description: "Expiring items and cautions" },
  { name: "Info", token: "--info", description: "Informational highlights" },
  { name: "Destructive", token: "--destructive", description: "Errors and delete actions" },
] as const;
