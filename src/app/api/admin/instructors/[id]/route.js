import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import { getUserFromRequest } from '@/lib/auth';
import { createSupabaseAdminClient, createSupabaseAuthClient } from '@/lib/supabase';
import { ensureLegacyInstructorOwnership } from '@/lib/adminScope';

// GET instructor details with their batches
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await ensureLegacyInstructorOwnership();
    const instructor = await User.findOne({
      _id: params.id,
      role: 'INSTRUCTOR',
      ownerSuperAdminId: currentUser._id,
    })
      .select('-password')
      .lean();

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    const batches = await Batch.find({
      $or: [{ instructorId: params.id }, { instructorIds: params.id }],
    })
      .populate('students', 'name email collegeRollNo')
      .lean();

    return NextResponse.json({
      success: true,
      instructor: {
        ...instructor,
        batches,
      },
    });
  } catch (error) {
    console.error('Admin get instructor detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update instructor details / toggle status / reset password
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await ensureLegacyInstructorOwnership();
    const body = await req.json();
    const instructor = await User.findOne({
      _id: params.id,
      role: 'INSTRUCTOR',
      ownerSuperAdminId: currentUser._id,
    });

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    // Toggle active / disable / enable
    if (body.isActive !== undefined) {
      instructor.isActive = body.isActive;
    }

    // Update details
    const authAttributes = {};
    if (body.name) {
      instructor.name = body.name.trim();
      if (instructor.supabaseId) {
        authAttributes.user_metadata = { full_name: instructor.name };
      }
    }
    if (body.phone !== undefined) instructor.phone = body.phone.trim();
    if (body.department !== undefined) instructor.department = body.department.trim();
    if (body.email && body.email.toLowerCase().trim() !== instructor.email) {
      return NextResponse.json(
        { error: 'Instructor email changes require a separate verification flow and cannot be changed here.' },
        { status: 400 }
      );
    }

    // Password reset by Super Admin
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      authAttributes.password = body.newPassword;
    }

    if (!instructor.supabaseId && body.newPassword) {
      const { data, error } = await createSupabaseAuthClient().auth.signUp({
        email: instructor.email,
        password: body.newPassword,
        options: {
          data: { full_name: instructor.name },
          emailRedirectTo: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/instructor/login`,
        },
      });
      if (error || !data.user) {
        return NextResponse.json({ error: error?.message || 'Could not create instructor authentication' }, { status: 400 });
      }
      if (data.user.identities?.length === 0) {
        return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 });
      }
      if (data.session) {
        const { error: cleanupError } = await createSupabaseAdminClient().auth.admin.deleteUser(data.user.id);
        if (cleanupError) console.error('Could not remove unverified instructor account:', cleanupError);
        return NextResponse.json(
          { error: 'Email confirmation is disabled in Supabase. Enable it before resetting instructor credentials.' },
          { status: 503 }
        );
      }

      instructor.supabaseId = data.user.id;
      instructor.password = undefined;
      try {
        await instructor.save();
      } catch (saveError) {
        await createSupabaseAdminClient().auth.admin.deleteUser(data.user.id);
        throw saveError;
      }

      const updatedObj = instructor.toObject();
      delete updatedObj.password;
      return NextResponse.json({
        success: true,
        requiresEmailConfirmation: true,
        message: 'Instructor authentication created. Verify the instructor email before signing in.',
        instructor: updatedObj,
      });
    }

    if (Object.keys(authAttributes).length > 0) {
      const supabaseAdmin = createSupabaseAdminClient();
      if (instructor.supabaseId) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(instructor.supabaseId, authAttributes);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      }
    }

    await instructor.save();

    const updatedObj = instructor.toObject();
    delete updatedObj.password;

    return NextResponse.json({
      success: true,
      message: 'Instructor updated successfully',
      instructor: updatedObj,
    });
  } catch (error) {
    console.error('Admin update instructor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE instructor
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    await ensureLegacyInstructorOwnership();
    const instructor = await User.findOne({
      _id: params.id,
      role: 'INSTRUCTOR',
      ownerSuperAdminId: currentUser._id,
    });
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    if (instructor.supabaseId) {
      const { error } = await createSupabaseAdminClient().auth.admin.deleteUser(instructor.supabaseId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 });
      }
    }
    await instructor.deleteOne();

    return NextResponse.json({
      success: true,
      message: 'Instructor deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete instructor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
