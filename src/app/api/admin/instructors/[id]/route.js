import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import { getUserFromRequest } from '@/lib/auth';
import bcrypt from 'bcryptjs';

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
    if (body.name) instructor.name = body.name.trim();
    if (body.phone !== undefined) instructor.phone = body.phone.trim();
    if (body.department !== undefined) instructor.department = body.department.trim();
    if (body.email && body.email.toLowerCase().trim() !== instructor.email) {
      const existing = await User.findOne({ email: body.email.toLowerCase().trim() });
      if (existing) {
        return NextResponse.json({ error: 'Email already in use' }, { status: 400 });
      }
      instructor.email = body.email.toLowerCase().trim();
    }

    // Password reset by Super Admin
    if (body.newPassword) {
      if (body.newPassword.length < 6) {
        return NextResponse.json({ error: 'Password must be at least 6 characters' }, { status: 400 });
      }
      instructor.password = body.newPassword;
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

    const instructor = await User.findOneAndDelete({ _id: params.id, role: 'INSTRUCTOR' });
    if (!instructor) {
      return NextResponse.json({ error: 'Instructor not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'Instructor deleted successfully',
    });
  } catch (error) {
    console.error('Admin delete instructor error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
