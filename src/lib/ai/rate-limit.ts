import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { apiError } from "@/lib/api";

let aiRatelimit: Ratelimit | null = null;

function getAiRatelimit() {
  if (
    !process.env.UPSTASH_REDIS_REST_URL ||
    !process.env.UPSTASH_REDIS_REST_TOKEN
  ) {
    return null;
  }
  if (!aiRatelimit) {
    aiRatelimit = new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(20, "1 h"),
      prefix: "ai",
      analytics: true,
    });
  }
  return aiRatelimit;
}

export async function checkAiRateLimit(userId: string) {
  const limiter = getAiRatelimit();
  if (!limiter) return null;

  const { success, reset } = await limiter.limit(`ai:${userId}`);
  if (!success) {
    const retryMinutes = Math.max(1, Math.ceil((reset - Date.now()) / 60000));
    return apiError(
      `AI rate limit reached. Try again in about ${retryMinutes} minute(s).`,
      429,
    );
  }
  return null;
}
