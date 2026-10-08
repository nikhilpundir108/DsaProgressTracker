import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { createSupabaseAuthClient } from '@/lib/supabase';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';
import User from '@/lib/models/User';

const genericResponse = {
  success: true,
  message: 'If an active account exists for that email, a password reset link has been sent.',
};

export async function POST(req) {
  const ip = getClientIp(req);
  const ipLimit = await enforceRateLimit(req, {
    namespace: 'forgot-password-ip',
    key: ip,
    limit: 5,
    window: '1 h',
  });
  if (ipLimit) return ipLimit;

  try {
    const { email } = await req.json();
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ error: 'Enter a valid email address' }, { status: 400 });
    }

    const emailLimit = await enforceRateLimit(req, {
      namespace: 'forgot-password-email',
      key: `${ip}:${cleanEmail}`,
      limit: 3,
      window: '15 m',
    });
    if (emailLimit) return emailLimit;

    await dbConnect();
    const user = await User.findOne({ email: cleanEmail, isActive: true }).select('role supabaseId');

    if (user?.supabaseId) {
      const redirectTo = new URL('/reset-password', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000');
      redirectTo.searchParams.set('role', user.role.toLowerCase());

      try {
        const { error } = await createSupabaseAuthClient().auth.resetPasswordForEmail(cleanEmail, {
          redirectTo: redirectTo.toString(),
        });
        if (error) console.error('Password recovery email request failed:', error.message);
      } catch (error) {
        console.error('Password recovery email request failed:', error);
      }
    }

    return NextResponse.json(genericResponse);
  } catch (error) {
    console.error('Forgot password request failed:', error);
    return NextResponse.json({ error: 'Password recovery is unavailable right now. Please try again later.' }, { status: 503 });
  }
}
