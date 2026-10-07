import { timingSafeEqual } from 'node:crypto';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { createAuthSessionResponse } from '@/lib/authSession';
import { createSupabaseAdminClient, getSupabaseUnavailableMessage, isSupabaseFetchFailure } from '@/lib/supabase';

function matchesRegistrationKey(providedKey, configuredKey) {
  if (typeof providedKey !== 'string' || !configuredKey) return false;

  const provided = Buffer.from(providedKey);
  const configured = Buffer.from(configuredKey);
  return provided.length === configured.length && timingSafeEqual(provided, configured);
}

export async function POST(req) {
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

    const supabaseAdmin = createSupabaseAdminClient();
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: cleanEmail,
      password,
      email_confirm: true,
      user_metadata: { full_name: cleanName },
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Could not create the Supabase account' }, { status: 400 });
    }

    try {
      const user = await User.create({
        name: cleanName,
        email: cleanEmail,
        supabaseId: authData.user.id,
        role: 'SUPER_ADMIN',
        isActive: true,
        isProfileComplete: true,
      });

      return createAuthSessionResponse(user, 'Super Admin account created');
    } catch (error) {
      await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
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