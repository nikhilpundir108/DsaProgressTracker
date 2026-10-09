import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import {
  createSupabaseAdminClient,
  createSupabaseAuthClient,
  getSupabaseUnavailableMessage,
  isSupabaseFetchFailure,
} from '@/lib/supabase';
import { enforceRateLimit, getClientIp } from '@/lib/rateLimit';

function matchesRegistrationKey(providedKey, configuredKey) {
  if (typeof providedKey !== 'string' || !configuredKey) return false;

  const provided = Buffer.from(providedKey);
  const configured = Buffer.from(configuredKey);
  return provided.length === configured.length && timingSafeEqual(provided, configured);
}

export async function POST(req) {
  const ip = getClientIp(req);
  const ipLimit = await enforceRateLimit(req, {
    namespace: 'super-admin-register-ip',
    key: ip,
    limit: 10,
    window: '1 h',
  });
  if (ipLimit) return ipLimit;

  const configuredKey = process.env.SUPER_ADMIN_REGISTRATION_KEY;
  if (!configuredKey) {
    return NextResponse.json(
      { error: 'Set SUPER_ADMIN_REGISTRATION_KEY in the server environment to enable Super Admin registration' },
      { status: 503 }
    );
  }

  try {
    const { name, email, password, registrationKey } = await req.json();
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    const emailLimit = await enforceRateLimit(req, {
      namespace: 'super-admin-register-email',
      key: `${ip}:${cleanEmail || 'missing'}`,
      limit: 5,
      window: '1 h',
    });
    if (emailLimit) return emailLimit;

    if (!matchesRegistrationKey(registrationKey, configuredKey)) {
      return NextResponse.json({ error: 'Invalid Super Admin invitation key' }, { status: 403 });
    }
    if (
      !cleanName ||
      cleanName.length > 100 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail) ||
      typeof password !== 'string'
    ) {
      return NextResponse.json({ error: 'Enter a valid name, email, and password' }, { status: 400 });
    }
    if (password.length < 12) {
      return NextResponse.json({ error: 'Password must be at least 12 characters' }, { status: 400 });
    }
    await dbConnect();
    if (await User.exists({ email: cleanEmail })) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }

    const { data: authData, error: authError } = await createSupabaseAuthClient().auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/admin/login`,
      },
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Could not create the Supabase account' }, { status: 400 });
    }
    if (authData.user.identities?.length === 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    if (authData.session) {
      const { error: cleanupError } = await createSupabaseAdminClient().auth.admin.deleteUser(authData.user.id);
      if (cleanupError) console.error('Could not remove unverified Super Admin account:', cleanupError);
      return NextResponse.json(
        { error: 'Email confirmation is disabled in Supabase. Enable it before registering administrators.' },
        { status: 503 }
      );
    }

    try {
      await User.create({
        name: cleanName,
        email: cleanEmail,
        supabaseId: authData.user.id,
        role: 'SUPER_ADMIN',
        isActive: true,
        isProfileComplete: true,
      });

      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: true,
        message: 'Check your email to verify your address, then sign in.',
      });
    } catch (error) {
      await createSupabaseAdminClient().auth.admin.deleteUser(authData.user.id);
      throw error;
    }
  } catch (error) {
    console.error('Super Admin registration error:', error);
    if (isSupabaseFetchFailure(error)) {
      return NextResponse.json(
        { error: getSupabaseUnavailableMessage() },
        { status: 503 }
      );
    }
    return NextResponse.json({ error: 'Unable to register this administrator right now' }, { status: 500 });
  }
}