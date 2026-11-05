// Simple sliding window rate limiter (5 requests per minute)
const requestLogs = new Map<string, number[]>();

export function checkRateLimit(identifier: string, limit: number = 5, windowMs: number = 60000): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const timestamps = (requestLogs.get(identifier) || []).filter(ts => now - ts < windowMs);

  if (timestamps.length >= limit) {
    const oldest = timestamps[0];
    const retryAfter = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds: Math.max(1, retryAfter) };
  }

  timestamps.push(now);
  requestLogs.set(identifier, timestamps);

  // Periodically cleanup stale entries
  if (requestLogs.size > 1000) {
    for (const [key, list] of requestLogs.entries()) {
      const active = list.filter(ts => now - ts < windowMs);
      if (active.length === 0) requestLogs.delete(key);
      else requestLogs.set(key, active);
    }
  }

  return { allowed: true };
}
