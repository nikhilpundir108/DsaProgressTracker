import { NextResponse } from 'next/server';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';

export async function middleware(req) {
  const limited = await enforceRateLimit(req, {
    namespace: 'api-global',
    key: getClientIp(req),
    limit: 900,
    window: '1 m',
  });

  return limited || NextResponse.next();
}

export const config = {
  matcher: ['/api/:path*'],
};
