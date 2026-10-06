import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { getUserFromRequest } from '@/lib/auth';
import { syncStudentData, syncBatchData } from '@/lib/platforms/sync';

export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let targetStudentId = currentUser._id;
    const body = await req.json().catch(() => ({}));

    // If instructor or admin passes studentId or batchId
    if (body.batchId && (currentUser.role === 'INSTRUCTOR' || currentUser.role === 'SUPER_ADMIN')) {
      const batchResult = await syncBatchData(body.batchId);
      return NextResponse.json({
        success: true,
        message: 'Batch synchronization completed',
        results: batchResult,
      });
    }

    if (body.studentId && (currentUser.role === 'INSTRUCTOR' || currentUser.role === 'SUPER_ADMIN')) {
      targetStudentId = body.studentId;
    }

    const result = await syncStudentData(targetStudentId);

    return NextResponse.json({
      success: true,
      message: result.message || 'Coding platform data synchronized successfully',
      updatedCount: result.updatedCount || 0,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
