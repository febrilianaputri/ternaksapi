import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN,
});
export const loginRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(5, "15 m"),
  analytics: true,
  prefix: "@ratelimit/login",
});
export const authRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(10, "1 m"),
  analytics: true,
  prefix: "@ratelimit/auth",
});

export const apiRateLimiter = new Ratelimit({
  redis: redis,
  limiter: Ratelimit.slidingWindow(20, "1 m"),
  analytics: true,
  prefix: "@ratelimit/api",
});

export async function shouldSendNotification(cattleId: string, alertType: string): Promise<boolean> {
  const cacheKey = `@telegram-cooldown:${cattleId}:${alertType}`;
  const isCooldownActive = await redis.get(cacheKey);
  if (isCooldownActive) {
    return false;
  }
  await redis.set(cacheKey, "active", { ex: 1800 });
  return true;
}
