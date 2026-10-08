import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import User from '@/lib/models/User';
import Assignment from '@/lib/models/Assignment';
import Submission from '@/lib/models/Submission';
import { getUserFromRequest } from '@/lib/auth';
import { isBatchInstructor } from '@/lib/batchAccess';

// GET students in batch with detailed stats
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batch = await Batch.findById(params.id).populate('students').lean();
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && !isBatchInstructor(batch, currentUser._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({
      success: true,
      students: batch.students || [],
    });
  } catch (error) {
    console.error('Get batch students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE remove student from batch
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const studentId = searchParams.get('studentId');

    if (!studentId) {
      return NextResponse.json({ error: 'Student ID is required' }, { status: 400 });
    }

    const batch = await Batch.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && !isBatchInstructor(batch, currentUser._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    batch.students = batch.students.filter((id) => id.toString() !== studentId);
    await batch.save();

    return NextResponse.json({
      success: true,
      message: 'Student removed from batch successfully',
    });
  } catch (error) {
    console.error('Remove student error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
