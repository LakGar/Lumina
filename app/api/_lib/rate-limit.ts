/**
 * In-memory per-user rate limit for API routes.
 * Use after requireAuth(); returns 429 if over limit.
 * For production with multiple instances, replace with Redis (e.g. @upstash/ratelimit).
 */

const windowMs = 60 * 1000; // 1 minute
const maxRequestsPerWindow = 120; // per user per minute

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

function getKey(userId: string): string {
  return `user:${userId}`;
}

export function checkRateLimit(userId: string): { ok: true } | { ok: false; retryAfter: number } {
  const now = Date.now();
  const key = getKey(userId);
  let entry = store.get(key);
  if (!entry || now >= entry.resetAt) {
    entry = { count: 1, resetAt: now + windowMs };
    store.set(key, entry);
    return { ok: true };
  }
  entry.count += 1;
  if (entry.count > maxRequestsPerWindow) {
    return { ok: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) };
  }
  return { ok: true };
}

/** Clean old keys periodically to avoid unbounded growth */
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [k, v] of store.entries()) {
      if (now >= v.resetAt) store.delete(k);
    }
  }, 60 * 1000);
}
