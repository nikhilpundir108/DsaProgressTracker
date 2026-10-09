import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { isAllowedStudentEmail } from '@/lib/auth';
import { createAuthSessionResponse } from '@/lib/authSession';
import {
  createSupabaseAdminClient,
  createSupabaseAuthClient,
  getSupabaseUnavailableMessage,
  isSupabaseFetchFailure,
} from '@/lib/supabase';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    const { identifier, password, role } = await req.json();
    const ip = getClientIp(req);
    const ipLimit = await enforceRateLimit(req, {
      namespace: 'login-ip',
      key: ip,
      limit: 60,
      window: '15 m',
    });
    if (ipLimit) return ipLimit;

    const accountLimit = await enforceRateLimit(req, {
      namespace: 'login-account',
      key: `${ip}:${typeof identifier === 'string' ? identifier.trim().toLowerCase() : 'missing'}`,
      limit: 12,
      window: '15 m',
    });
    if (accountLimit) return accountLimit;

    await dbConnect();

    if (!identifier || !password) {
      return NextResponse.json({ error: 'Please provide identifier/email and password' }, { status: 400 });
    }

    const cleanIdentifier = identifier.trim();

    const query = {
      $or: [
        { email: cleanIdentifier.toLowerCase() },
        { instructorId: cleanIdentifier.toUpperCase() },
      ],
    };

    if (role && !['SUPER_ADMIN', 'INSTRUCTOR', 'STUDENT'].includes(role)) {
      return NextResponse.json({ error: 'Invalid account role' }, { status: 400 });
    }
    if (role) query.role = role;

    const user = await User.findOne(query).select('+password');

    if (!user) {
      return NextResponse.json({ error: 'Invalid email/ID or password' }, { status: 401 });
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Your account has been deactivated. Please contact the administrator.' },
        { status: 403 }
      );
    }

    if (user.role === 'STUDENT' && !isAllowedStudentEmail(user.email)) {
      return NextResponse.json({ error: 'Use your official @mit.ac.in or @miet.ac.in email address' }, { status: 403 });
    }

    const supabase = createSupabaseAuthClient();
    let { data, error } = await supabase.auth.signInWithPassword({
      email: user.email,
      password,
    });

    if (error?.code === 'email_not_confirmed') {
      return NextResponse.json({ error: 'Verify your email address before signing in.' }, { status: 403 });
    }

    if (error && !user.supabaseId && user.password && (await user.comparePassword(password))) {
      const { data: registration, error: registrationError } = await supabase.auth.signUp({
        email: user.email,
        password,
        options: {
          data: { full_name: user.name },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/${user.role === 'SUPER_ADMIN' ? 'admin' : user.role === 'INSTRUCTOR' ? 'instructor' : 'student'}/login`,
        },
      });

      if (registrationError) {
        return NextResponse.json({ error: registrationError.message }, { status: 400 });
      }
      if (!registration.user || registration.user.identities?.length === 0) {
        return NextResponse.json({ error: 'Could not create a verified sign-in account. Contact an administrator.' }, { status: 409 });
      }
      if (registration.session) {
        const { error: cleanupError } = await createSupabaseAdminClient().auth.admin.deleteUser(registration.user.id);
        if (cleanupError) console.error('Could not remove account created without email confirmation:', cleanupError);
        return NextResponse.json(
          { error: 'Email confirmation is disabled in Supabase. Enable it before signing in.' },
          { status: 503 }
        );
      }

      user.supabaseId = registration.user.id;
      user.password = undefined;
      await user.save();
      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: true,
        message: 'Check your email to verify your address, then sign in.',
      });
    }

    if (error || !data.user) {
      return NextResponse.json({ error: 'Invalid email/ID or password' }, { status: 401 });
    }

    user.supabaseId = data.user.id;
    user.password = undefined;
    await user.save();

    return createAuthSessionResponse(user);
  } catch (error) {
    console.error('Login error:', error);
    if (isSupabaseFetchFailure(error)) {
      return NextResponse.json({ error: getSupabaseUnavailableMessage() }, { status: 503 });
    }
    return NextResponse.json({ error: 'Authentication service is unavailable. Please try again.' }, { status: 500 });
  }
}
