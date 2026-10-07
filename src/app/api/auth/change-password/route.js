import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import { createSupabaseAdminClient, createSupabaseAuthClient } from '@/lib/supabase';

export async function POST(req) {
  try {
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { currentPassword, newPassword, confirmPassword } = await req.json();

    if (!newPassword || newPassword.length < 8) {
      return NextResponse.json({ error: 'New password must be at least 8 characters long' }, { status: 400 });
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json({ error: 'New password and confirm password do not match' }, { status: 400 });
    }

    if (!currentUser.supabaseId || !currentPassword) {
      return NextResponse.json({ error: 'Enter your current password before changing it' }, { status: 400 });
    }

    const { error: verifyError } = await createSupabaseAuthClient().auth.signInWithPassword({
      email: currentUser.email,
      password: currentPassword,
    });
    if (verifyError) {
      return NextResponse.json({ error: 'Current password is incorrect' }, { status: 400 });
    }

    const { error } = await createSupabaseAdminClient().auth.admin.updateUserById(currentUser.supabaseId, {
      password: newPassword,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: 'Password updated successfully',
    });
  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
