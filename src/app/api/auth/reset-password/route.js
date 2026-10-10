import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { createSupabaseAuthClient } from '@/lib/supabase';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';
import User from '@/lib/models/User';

export async function POST(req) {
  const rateLimitResponse = await enforceRateLimit(req, {
    namespace: 'reset-password-ip',
    key: getClientIp(req),
    limit: 60,
    window: '15 m',
  });
  if (rateLimitResponse) return rateLimitResponse;

  try {
    const { accessToken, refreshToken, password } = await req.json();
    if (
      typeof accessToken !== 'string' ||
      typeof refreshToken !== 'string' ||
      typeof password !== 'string' ||
      password.length < 8
    ) {
      return NextResponse.json({ error: 'The reset link is invalid or the password is too short.' }, { status: 400 });
    }

    const supabase = createSupabaseAuthClient();
    const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    if (sessionError || !sessionData.user) {
      return NextResponse.json({ error: 'This password reset link is invalid or has expired. Request a new one.' }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findOne({ supabaseId: sessionData.user.id, isActive: true }).select('role');
    if (!user) {
      return NextResponse.json({ error: 'This account cannot reset its password. Contact an administrator.' }, { status: 403 });
    }
    if (user.role === 'SUPER_ADMIN' && password.length < 12) {
      return NextResponse.json({ error: 'Super Admin passwords must be at least 12 characters long.' }, { status: 400 });
    }

    const { error: updateError } = await supabase.auth.updateUser({ password });
    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: 'Password reset successfully. You can now sign in.' });
  } catch (error) {
    console.error('Reset password failed:', error);
    return NextResponse.json({ error: 'Password reset is unavailable right now. Please try again later.' }, { status: 503 });
  }
}
