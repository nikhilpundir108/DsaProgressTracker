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

export async function POST(req) {
  try {
    await dbConnect();
    const { identifier, password, role } = await req.json();

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

    if (error && !user.supabaseId && user.password && (await user.comparePassword(password))) {
      const { data: created, error: createError } = await createSupabaseAdminClient().auth.admin.createUser({
        email: user.email,
        password,
        email_confirm: true,
        user_metadata: { full_name: user.name },
      });

      if (!createError && created.user) {
        data = { user: created.user };
        error = null;
      }
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
