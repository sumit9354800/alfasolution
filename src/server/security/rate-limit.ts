import "server-only";
import { execute, queryOne } from "../db";

/**
 * Fixed-window rate limiter backed by MySQL, so limits hold across restarts
 * and across multiple Node processes on the host.
 * Returns true when the request is allowed.
 */
export async function rateLimit(bucket: string, limit: number, windowSeconds: number): Promise<boolean> {
  const key = bucket.slice(0, 191);
  await execute(
    `INSERT INTO rate_limits (bucket, hits, reset_at) VALUES (?, 1, UTC_TIMESTAMP() + INTERVAL ? SECOND)
     ON DUPLICATE KEY UPDATE
       hits = IF(reset_at < UTC_TIMESTAMP(), 1, hits + 1),
       reset_at = IF(reset_at < UTC_TIMESTAMP(), UTC_TIMESTAMP() + INTERVAL ? SECOND, reset_at)`,
    [key, windowSeconds, windowSeconds]
  );
  const row = await queryOne<{ hits: number }>("SELECT hits FROM rate_limits WHERE bucket = ?", [key]);

  // Opportunistic cleanup of expired buckets (~1% of calls).
  if (Math.random() < 0.01) {
    void execute("DELETE FROM rate_limits WHERE reset_at < UTC_TIMESTAMP() - INTERVAL 1 DAY").catch(() => undefined);
  }
  return (row?.hits ?? 0) <= limit;
}

export async function clearRateLimit(bucket: string) {
  await execute("DELETE FROM rate_limits WHERE bucket = ?", [bucket.slice(0, 191)]);
}
