// Redis-based rate limiter for API endpoints using Upstash (optional: skipped when env not set)
import { Redis } from "@upstash/redis";

interface RateLimitResult {
  allowed: boolean;
  resetTime?: number;
  remaining?: number;
}

const MAX_REQUESTS = 25;
const WINDOW_MS = 24 * 60 * 60 * 1000; // 24 hours

function isRedisConfigured(): boolean {
  const url = process.env.KV_REST_API_URL;
  const token = process.env.KV_REST_API_TOKEN;
  return Boolean(url && token && url.startsWith("https://"));
}

class RedisRateLimiter {
  private redis: Redis | null = null;
  private readonly maxRequests: number;
  private readonly windowMs: number;

  constructor(maxRequests = MAX_REQUESTS, windowMs = WINDOW_MS) {
    this.maxRequests = maxRequests;
    this.windowMs = windowMs;
    if (isRedisConfigured()) {
      this.redis = new Redis({
        url: process.env.KV_REST_API_URL!,
        token: process.env.KV_REST_API_TOKEN!,
      });
    }
  }

  async isAllowed(identifier: string): Promise<RateLimitResult> {
    const now = Date.now();
    const resetTime = now + this.windowMs;

    if (!this.redis) {
      return { allowed: true, resetTime, remaining: this.maxRequests };
    }

    const key = `rate_limit:${identifier}`;

    try {
      const pipeline = this.redis.pipeline();
      pipeline.incr(key);
      pipeline.expire(key, Math.ceil(this.windowMs / 1000));

      const results = await pipeline.exec();
      const count = results[0] as number;

      if (count <= this.maxRequests) {
        return {
          allowed: true,
          resetTime,
          remaining: this.maxRequests - count,
        };
      }
      return {
        allowed: false,
        resetTime,
        remaining: 0,
      };
    } catch (error) {
      console.warn(
        "weDat Redis rate limiter unavailable, allowing request:",
        error instanceof Error ? error.message : "Unknown error"
      );
      this.redis = null;
      return {
        allowed: true,
        resetTime,
        remaining: this.maxRequests - 1,
      };
    }
  }
}

export const rateLimiter = new RedisRateLimiter(MAX_REQUESTS, WINDOW_MS);

// Helper function to get client IP
export function getClientIP(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  const realIP = request.headers.get("x-real-ip");

  if (forwarded) {
    return forwarded.split(",")[0].trim();
  }

  if (realIP) {
    return realIP;
  }

  // Fallback for development
  return "unknown";
}
