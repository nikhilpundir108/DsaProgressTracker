import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import User from '@/lib/models/User';
import Assignment from '@/lib/models/Assignment';
import BatchJoinRequest from '@/lib/models/BatchJoinRequest';
import { getUserFromRequest } from '@/lib/auth';
import { isBatchInstructor } from '@/lib/batchAccess';

// GET batch by ID
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batch = await Batch.findById(params.id)
      .populate('instructorId', 'name email instructorId department phone')
      .populate('students', 'name email collegeRollNo branch section graduationYear leetcodeHandle gfgHandle leetcodeStats gfgStats isActive')
      .lean();

    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    // Role check
    if (currentUser.role === 'INSTRUCTOR') {
      if (!isBatchInstructor(batch, currentUser._id)) {
        return NextResponse.json({ error: 'You do not have permission to view this batch' }, { status: 403 });
      }
    } else if (currentUser.role === 'STUDENT') {
      const isEnrolled = batch.students.some((s) => s._id.toString() === currentUser._id.toString());
      if (!isEnrolled) {
        return NextResponse.json({ error: 'You are not enrolled in this batch' }, { status: 403 });
      }
    }

    // Fetch assignments and pending requests
    const [assignments, pendingRequests] = await Promise.all([
      Assignment.find({ batchId: batch._id }).sort({ deadline: 1 }).lean(),
      BatchJoinRequest.find({ batchId: batch._id, status: 'PENDING' })
        .populate('studentId', 'name email collegeRollNo branch section leetcodeHandle gfgHandle')
        .sort({ requestedAt: -1 })
        .lean(),
    ]);

    return NextResponse.json({
      success: true,
      batch: {
        ...batch,
        assignments,
        pendingRequests,
      },
    });
  } catch (error) {
    console.error('Get batch detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update batch
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const batch = await Batch.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && !isBatchInstructor(batch, currentUser._id)) {
      return NextResponse.json({ error: 'You cannot edit another instructor batch' }, { status: 403 });
    }

    const body = await req.json();
    if (body.name) batch.name = body.name.trim();
    if (body.branch) batch.branch = body.branch.trim().toUpperCase();
    if (body.section) batch.section = body.section.trim().toUpperCase();
    if (body.academicYear) batch.academicYear = String(body.academicYear).trim();
    if (body.description !== undefined) batch.description = body.description.trim();
    if (body.isArchived !== undefined) batch.isArchived = body.isArchived;

    await batch.save();

    return NextResponse.json({
      success: true,
      message: 'Batch updated successfully',
      batch,
    });
  } catch (error) {
    console.error('Update batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE archive/delete batch
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const batch = await Batch.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && !isBatchInstructor(batch, currentUser._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    batch.isArchived = true;
    await batch.save();

    return NextResponse.json({
      success: true,
      message: 'Batch archived successfully',
    });
  } catch (error) {
    console.error('Delete batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
