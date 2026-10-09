import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import BatchJoinRequest from '@/lib/models/BatchJoinRequest';
import { getUserFromRequest } from '@/lib/auth';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'STUDENT') {
      return NextResponse.json({ error: 'Only students can request to join batches' }, { status: 403 });
    }

    const rateLimitResponse = await enforceRateLimit(req, {
      namespace: 'student-join-batch-user',
      key: currentUser._id.toString(),
      limit: 30,
      window: '1 h',
    });
    if (rateLimitResponse) return rateLimitResponse;

    const { code } = await req.json();

    if (!code || typeof code !== 'string') {
      return NextResponse.json({ error: 'Please provide a valid batch code' }, { status: 400 });
    }

    const cleanCode = code.trim().toUpperCase();

    const batch = await Batch.findOne({ code: cleanCode, isArchived: { $ne: true } })
      .populate('instructorId', 'name email')
      .lean();

    if (!batch) {
      return NextResponse.json({ error: `Batch with code "${cleanCode}" not found` }, { status: 404 });
    }

    // Check if already in batch
    const alreadyEnrolled = batch.students.some((sId) => sId.toString() === currentUser._id.toString());
    if (alreadyEnrolled) {
      return NextResponse.json({ error: 'You are already an approved member of this batch' }, { status: 400 });
    }

    // Check if pending or existing request
    const existingRequest = await BatchJoinRequest.findOne({
      studentId: currentUser._id,
      batchId: batch._id,
    });

    if (existingRequest) {
      if (existingRequest.status === 'PENDING') {
        return NextResponse.json({
          success: true,
          message: 'Your join request is already pending instructor approval',
          status: 'PENDING',
          batch: {
            name: batch.name,
            code: batch.code,
            instructorName: batch.instructorId?.name,
          },
        });
      } else if (existingRequest.status === 'REJECTED') {
        // Reset to PENDING for re-request
        existingRequest.status = 'PENDING';
        existingRequest.requestedAt = new Date();
        await existingRequest.save();

        return NextResponse.json({
          success: true,
          message: 'Join request re-submitted to instructor',
          status: 'PENDING',
          batch: {
            name: batch.name,
            code: batch.code,
            instructorName: batch.instructorId?.name,
          },
        });
      }
    }

    // Create new join request
    const newRequest = await BatchJoinRequest.create({
      studentId: currentUser._id,
      batchId: batch._id,
      status: 'PENDING',
      requestedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      message: 'Join request sent successfully! Awaiting instructor approval.',
      status: 'PENDING',
      batch: {
        name: batch.name,
        code: batch.code,
        instructorName: batch.instructorId?.name,
      },
    });
  } catch (error) {
    console.error('Join batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
