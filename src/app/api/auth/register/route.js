import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import { isAllowedStudentEmail } from '@/lib/auth';
import { createAuthSessionResponse } from '@/lib/authSession';
import { createSupabaseAuthClient, getSupabaseUnavailableMessage, isSupabaseFetchFailure } from '@/lib/supabase';

export async function POST(req) {
  try {
    const { name, email, password } = await req.json();
    const cleanName = typeof name === 'string' ? name.trim() : '';
    const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';

    if (!cleanName || !cleanEmail || typeof password !== 'string') {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 });
    }
    if (!isAllowedStudentEmail(cleanEmail)) {
      return NextResponse.json({ error: 'Register with an official @mit.ac.in or @miet.ac.in email address' }, { status: 403 });
    }

    await dbConnect();
    let user = await User.findOne({ email: cleanEmail }).select('+password');
    if (user && user.role !== 'STUDENT') {
      return NextResponse.json({ error: 'This email belongs to a staff account. Use the staff sign-in page.' }, { status: 409 });
    }
    if (user?.supabaseId) {
      return NextResponse.json({ error: 'An account already exists. Please sign in instead.' }, { status: 409 });
    }
    if (user && !user.isActive) {
      return NextResponse.json({ error: 'Your account has been deactivated. Please contact the administrator.' }, { status: 403 });
    }

    const supabase = createSupabaseAuthClient();
    const { data, error } = await supabase.auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: cleanName },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/student/login`,
      },
    });

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if (!data.user || data.user.identities?.length === 0) {
      return NextResponse.json({ error: 'An account already exists. Please sign in instead.' }, { status: 409 });
    }

    if (!user) {
      user = new User({
        name: cleanName,
        email: cleanEmail,
        role: 'STUDENT',
        isActive: true,
        isProfileComplete: false,
      });
    }
    user.supabaseId = data.user.id;
    user.password = undefined;
    await user.save();

    if (!data.session) {
      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: true,
        message: 'Check your email to confirm your account, then sign in.',
      });
    }

    return createAuthSessionResponse(user, 'Account created successfully');
  } catch (error) {
    console.error('Registration error:', error);
    if (isSupabaseFetchFailure(error)) {
      return NextResponse.json({ error: getSupabaseUnavailableMessage() }, { status: 503 });
    }
    return NextResponse.json({ error: 'Unable to create your account right now. Please try again.' }, { status: 500 });
  }
}