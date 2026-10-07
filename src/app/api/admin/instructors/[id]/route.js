import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import { getUserFromRequest } from '@/lib/auth';
import { createSupabaseAdminClient } from '@/lib/supabase';

// GET instructor details with their batches
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const instructor = await User.findOne({ _id: params.id, role: 'INSTRUCTOR' })
      .select('-password')
      .lean();

    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    const batches = await Batch.find({ instructorId: params.id })
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

    const body = await req.json();
    const instructor = await User.findOne({ _id: params.id, role: 'INSTRUCTOR' });

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
      const existing = await User.findOne({ email: body.email.toLowerCase().trim() });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      instructor.email = body.email.toLowerCase().trim();
      if (instructor.supabaseId) {
        authAttributes.email = instructor.email;
        authAttributes.email_confirm = true;
      }
    }

    // Password reset by Super Admin
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      authAttributes.password = body.newPassword;
    }

    if (Object.keys(authAttributes).length > 0) {
      const supabaseAdmin = createSupabaseAdminClient();
      if (instructor.supabaseId) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(instructor.supabaseId, authAttributes);
        if (error) {
          return NextResponse.json({ error: error.message }, { status: 400 });
        }
      } else if (body.newPassword) {
        const { data, error } = await supabaseAdmin.auth.admin.createUser({
          email: instructor.email,
          password: body.newPassword,
          email_confirm: true,
          user_metadata: { full_name: instructor.name },
        });
        if (error || !data.user) {
          return NextResponse.json({ error: error?.message || 'Could not create instructor authentication' }, { status: 400 });
        }
        instructor.supabaseId = data.user.id;
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

    const instructor = await User.findOne({ _id: params.id, role: 'INSTRUCTOR' });
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
