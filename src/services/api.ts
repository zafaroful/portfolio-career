const API_BASE = "/api/v1";

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options?: RequestInit,
): Promise<{ data: T; meta?: Record<string, unknown> }> {
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      ...(options?.body instanceof FormData
        ? {}
        : { "Content-Type": "application/json" }),
      ...options?.headers,
    },
  });

  const json = await res.json();
  if (!res.ok) {
    throw new ApiError(json.message ?? "Request failed", res.status);
  }
  return json;
}

export const api = {
  get: <T>(path: string) => request<T>(path),
  post: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "POST", body: JSON.stringify(body) }),
  patch: <T>(path: string, body: unknown) =>
    request<T>(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: <T>(path: string) => request<T>(path, { method: "DELETE" }),
  upload: <T>(formData: FormData) =>
    request<T>("/upload", { method: "POST", body: formData }),
  uploadResume: <T>(formData: FormData) =>
    request<T>("/resumes/upload", { method: "POST", body: formData }),
  generateResume: <T>(body: {
    versionName: string;
    templateId: string;
    jobDescription?: string;
    tailoringHints?: {
      highlightedProjectIds?: string[];
      highlightedSkillIds?: string[];
      rewrittenProjectBullets?: { projectId: string; bullets: string[] }[];
      summaryLine?: string;
    };
  }) => request<T>("/resumes/generate", { method: "POST", body: JSON.stringify(body) }),
  aiProjectDescription: <T>(body: {
    title: string;
    role?: string;
    techStack?: string[];
    roughNotes: string;
    tone?: "professional" | "technical" | "leadership";
  }) => request<T>("/ai/projects/description", { method: "POST", body: JSON.stringify(body) }),
  aiTailorResume: <T>(body: {
    jobDescription: string;
    targetRole?: string;
    templateId?: string;
  }) => request<T>("/ai/resumes/tailor", { method: "POST", body: JSON.stringify(body) }),
  aiSkillsGap: <T>(body: { jobPosting: string; targetRole?: string }) =>
    request<T>("/ai/skills/gap-analysis", { method: "POST", body: JSON.stringify(body) }),
  aiPortfolioCoach: <T>() =>
    request<T>("/ai/portfolio/coach", { method: "POST", body: JSON.stringify({}) }),
  aiSmartSearch: <T>(body: { query: string }) =>
    request<T>("/ai/search", { method: "POST", body: JSON.stringify(body) }),
  aiAchievementStory: <T>(body: {
    title: string;
    roughNotes: string;
    category?: string;
  }) => request<T>("/ai/achievements/story", { method: "POST", body: JSON.stringify(body) }),
  aiGenerateBio: <T>(body?: {
    tone?: "professional" | "technical" | "leadership";
    maxLength?: number;
  }) => request<T>("/ai/settings/bio", { method: "POST", body: JSON.stringify(body ?? {}) }),
  aiSeoOptimizer: <T>() =>
    request<T>("/ai/portfolio/seo", { method: "POST", body: JSON.stringify({}) }),
  aiCertRelevance: <T>() =>
    request<T>("/ai/certifications/score", { method: "POST", body: JSON.stringify({}) }),
  aiInterviewQuestions: <T>(body: {
    entityType: "project" | "skill" | "certification" | "achievement";
    entityId: string;
  }) => request<T>("/ai/interview/questions", { method: "POST", body: JSON.stringify(body) }),
};
