import { NextResponse } from 'next/server';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis/cloudflare';

const limiters = new Map();
let redis;

export function getClientIp(req) {
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  const forwardedFor = req.headers.get('x-forwarded-for');
  if (forwardedFor) {
    const firstIp = forwardedFor.split(',')[0]?.trim();
    if (firstIp) return firstIp;
  }

  return 'unknown';
}

async function hashKey(value) {
  const bytes = new TextEncoder().encode(value);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, '0')).join('');
}

function getLimiter({ namespace, limit, window }) {
  const cacheKey = `${namespace}:${limit}:${window}`;
  if (limiters.has(cacheKey)) return limiters.get(cacheKey);

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) return null;

  redis ||= new Redis({ url, token });
  const limiter = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(limit, window),
    prefix: `dsatrack:ratelimit:${namespace}`,
  });

  limiters.set(cacheKey, limiter);
  return limiter;
}

export async function enforceRateLimit(req, { namespace, key, limit, window }) {
  const limiter = getLimiter({ namespace, limit, window });

  if (!limiter) {
    if (process.env.NODE_ENV !== 'production') return null;

    return NextResponse.json(
      { error: 'Rate limiting is not configured on the server' },
      { status: 503 }
    );
  }

  try {
    const result = await limiter.limit(await hashKey(`${namespace}:${key}`));
    if (result.success) return null;

    const retryAfter = Math.max(1, Math.ceil((result.reset - Date.now()) / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please try again later.', retryAfterSeconds: retryAfter },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'RateLimit-Limit': String(result.limit),
          'RateLimit-Remaining': String(result.remaining),
          'RateLimit-Reset': String(Math.ceil(result.reset / 1000)),
        },
      }
    );
  } catch (error) {
    console.error(`Rate limiter unavailable for ${namespace}:`, error);
    return NextResponse.json({ error: 'Request protection is temporarily unavailable' }, { status: 503 });
  }
}
