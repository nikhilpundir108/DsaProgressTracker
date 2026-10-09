import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import { getUserFromRequest, generateInstructorId } from '@/lib/auth';
import { createSupabaseAdminClient, createSupabaseAuthClient } from '@/lib/supabase';
import { ensureLegacyInstructorOwnership } from '@/lib/adminScope';

// GET all instructors with their batch counts
export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await ensureLegacyInstructorOwnership();
    const instructors = await User.find({ role: 'INSTRUCTOR', ownerSuperAdminId: currentUser._id })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    // Get batch count for each instructor
    const instructorIds = instructors.map((i) => i._id);
    const batches = await Batch.find({ instructorId: { $in: instructorIds }, isArchived: { $ne: true } }).lean();

    const batchCountMap = {};
    batches.forEach((b) => {
      const insId = b.instructorId.toString();
      batchCountMap[insId] = (batchCountMap[insId] || 0) + 1;
    });

    const instructorsWithCounts = instructors.map((ins) => ({
      ...ins,
      batchCount: batchCountMap[ins._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      instructors: instructorsWithCounts,
    });
  } catch (error) {
    console.error('Admin get instructors error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new instructor
export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Only Super Admin can create instructors' }, { status: 403 });
    }

    const { name, email, phone, department, password, confirmPassword } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Name, email, and password are required' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'Password must be at least 6 characters long' }, { status: 400 });
    }

    if (confirmPassword && password !== confirmPassword) {
      return NextResponse.json({ error: 'Passwords do not match' }, { status: 400 });
    }

    const cleanEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return NextResponse.json({ error: `User with email ${cleanEmail} already exists` }, { status: 400 });
    }

    // Generate unique Instructor ID e.g. INS001
    const instructorId = await generateInstructorId();

    const { data: authData, error: authError } = await createSupabaseAuthClient().auth.signUp({
      email: cleanEmail,
      password,
      options: {
        data: { full_name: name.trim() },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/instructor/login`,
      },
    });
    if (authError || !authData.user) {
      return NextResponse.json({ error: authError?.message || 'Could not create instructor authentication' }, { status: 400 });
    }
    if (authData.user.identities?.length === 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
    }
    if (authData.session) {
      const { error: cleanupError } = await createSupabaseAdminClient().auth.admin.deleteUser(authData.user.id);
      if (cleanupError) console.error('Could not remove unverified instructor account:', cleanupError);
      return NextResponse.json(
        { error: 'Email confirmation is disabled in Supabase. Enable it before creating instructors.' },
        { status: 503 }
      );
    }

    let newInstructor;
    try {
      newInstructor = await User.create({
        name: name.trim(),
        email: cleanEmail,
        supabaseId: authData.user.id,
        role: 'INSTRUCTOR',
        ownerSuperAdminId: currentUser._id,
        instructorId,
        phone: phone?.trim() || '',
        department: department?.trim() || 'Computer Science',
        isActive: true,
        isProfileComplete: true,
      });
    } catch (error) {
      await createSupabaseAdminClient().auth.admin.deleteUser(authData.user.id);
      throw error;
    }

    const instructorObj = newInstructor.toObject();
    delete instructorObj.password;

    return NextResponse.json({
      success: true,
      requiresEmailConfirmation: true,
      message: 'Instructor created. A verification email has been sent to the instructor.',
      instructor: instructorObj,
      rawPassword: password, // For one-time display to Super Admin as per spec
    });
  } catch (error) {
    console.error('Admin create instructor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
