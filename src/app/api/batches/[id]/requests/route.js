import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import BatchJoinRequest from '@/lib/models/BatchJoinRequest';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET pending join requests for batch
export async function GET(req, { params }) {
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

    if (currentUser.role === 'INSTRUCTOR' && batch.instructorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const requests = await BatchJoinRequest.find({ batchId: params.id, status: 'PENDING' })
      .populate('studentId', 'name email collegeRollNo branch section graduationYear leetcodeHandle gfgHandle')
      .sort({ requestedAt: -1 })
      .lean();

    return NextResponse.json({
      success: true,
      requests,
    });
  } catch (error) {
    console.error('Get join requests error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST approve or reject join request
export async function POST(req, { params }) {
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

    if (currentUser.role === 'INSTRUCTOR' && batch.instructorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { requestId, action } = await req.json(); // action: 'APPROVE' or 'REJECT'

    if (!requestId || !action) {
      return NextResponse.json({ error: 'Request ID and action (APPROVE/REJECT) are required' }, { status: 400 });
    }

    const joinRequest = await BatchJoinRequest.findById(requestId);
    if (!joinRequest || joinRequest.batchId.toString() !== params.id) {
      return NextResponse.json({ error: 'Join request not found' }, { status: 404 });
    }

    if (action === 'APPROVE') {
      joinRequest.status = 'APPROVED';
      joinRequest.approvedAt = new Date();
      joinRequest.approvedBy = currentUser._id;
      await joinRequest.save();

      // Add student to batch if not already in students list
      const isAlreadyIn = batch.students.some((sId) => sId.toString() === joinRequest.studentId.toString());
      if (!isAlreadyIn) {
        batch.students.push(joinRequest.studentId);
        await batch.save();
      }

      return NextResponse.json({
        success: true,
        message: 'Student join request approved successfully',
      });
    } else if (action === 'REJECT') {
      joinRequest.status = 'REJECTED';
      await joinRequest.save();

      return NextResponse.json({
        success: true,
        message: 'Student join request rejected',
      });
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be APPROVE or REJECT' }, { status: 400 });
    }
  } catch (error) {
    console.error('Handle join request error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
