import { z } from "zod";

export const proficiencySchema = z.enum([
  "BEGINNER",
  "INTERMEDIATE",
  "ADVANCED",
  "EXPERT",
]);

export const skillCreateSchema = z.object({
  name: z.string().min(1).max(100),
  category: z.string().min(1).max(100),
  proficiency: proficiencySchema.default("INTERMEDIATE"),
  yearsExperience: z.number().min(0).max(50).default(0),
  endorsements: z.array(z.string()).default([]),
});

export const skillUpdateSchema = skillCreateSchema.partial();

export const certificationCreateSchema = z.object({
  title: z.string().min(1).max(200),
  issuer: z.string().min(1).max(200),
  issueDate: z.coerce.date(),
  expiryDate: z.coerce.date().optional().nullable(),
  credentialId: z.string().max(200).optional().nullable(),
  fileUrl: z.string().optional().nullable(),
});

export const certificationUpdateSchema = certificationCreateSchema.partial();

export const achievementCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional().nullable(),
  date: z.coerce.date(),
  category: z.string().max(100).optional().nullable(),
});

export const achievementUpdateSchema = achievementCreateSchema.partial();

export const projectCreateSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(5000).optional().nullable(),
  techStack: z.array(z.string()).default([]),
  role: z.string().max(200).optional().nullable(),
  startDate: z.coerce.date().optional().nullable(),
  endDate: z.coerce.date().optional().nullable(),
  links: z
    .array(z.object({ label: z.string(), url: z.string().url() }))
    .default([]),
  imageUrl: z.string().optional().nullable(),
  isPublic: z.boolean().default(true),
});

export const projectUpdateSchema = projectCreateSchema.partial();

export const resumeGenerateSchema = z.object({
  versionName: z.string().min(1).max(100),
  templateId: z.enum(["modern", "classic"]),
});

export const settingsUpdateSchema = z.object({
  name: z.string().min(1).max(100).optional(),
  bio: z.string().max(2000).optional().nullable(),
  photoUrl: z.string().optional().nullable(),
  portfolioSlug: z
    .string()
    .min(3)
    .max(50)
    .regex(/^[a-z0-9-]+$/)
    .optional(),
  isPublic: z.boolean().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});
