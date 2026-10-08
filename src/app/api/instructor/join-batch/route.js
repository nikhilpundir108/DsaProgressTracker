import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import { getUserFromRequest } from '@/lib/auth';
import { isBatchInstructor } from '@/lib/batchAccess';
import { enforceRateLimit } from '@/lib/rateLimit';

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'INSTRUCTOR') {
      return NextResponse.json({ error: 'Only instructors can join batches' }, { status: 403 });
    }

    const rateLimitResponse = await enforceRateLimit(req, {
      namespace: 'instructor-join-batch-user',
      key: currentUser._id.toString(),
      limit: 10,
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

    const instructorId = currentUser._id.toString();
    const joinedInstructorIds = (batch.instructorIds || []).map((id) => id.toString());
    const isAlreadyJoined = joinedInstructorIds.includes(instructorId) || isBatchInstructor(batch, currentUser._id);

    if (isAlreadyJoined) {
      return NextResponse.json({
        success: true,
        message: 'You are already part of this batch.',
        batch: {
          name: batch.name,
          code: batch.code,
          instructorName: batch.instructorId?.name,
        },
      });
    }

    const currentBatch = await Batch.findById(batch._id);
    if (!currentBatch.instructorIds) currentBatch.instructorIds = [];
    if (!currentBatch.instructorIds.some((id) => id.toString() === instructorId)) {
      currentBatch.instructorIds.push(currentUser._id);
      if (!currentBatch.instructorId) {
        currentBatch.instructorId = currentUser._id;
      }
      await currentBatch.save();
    }

    const membershipSaved = await Batch.exists({ _id: batch._id, instructorIds: currentUser._id });
    if (!membershipSaved) {
      return NextResponse.json({ error: 'Batch membership could not be saved. Please retry joining.' }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: 'You have successfully joined this batch as an instructor.',
      batch: {
        name: batch.name,
        code: batch.code,
        instructorName: batch.instructorId?.name,
      },
    });
  } catch (error) {
    console.error('Instructor join batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
