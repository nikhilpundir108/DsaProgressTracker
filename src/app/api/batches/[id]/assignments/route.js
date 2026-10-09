import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import Assignment from '@/lib/models/Assignment';
import Submission from '@/lib/models/Submission';
import { getUserFromRequest } from '@/lib/auth';
import { isBatchInstructor } from '@/lib/batchAccess';
import { isOwnedBatch } from '@/lib/adminScope';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const batch = await Batch.findById(params.id);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && !isBatchInstructor(batch, currentUser._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (currentUser.role === 'SUPER_ADMIN' && !(await isOwnedBatch(currentUser._id, batch._id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (currentUser.role === 'STUDENT' && !batch.students.some((id) => id.toString() === currentUser._id.toString())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const assignments = await Assignment.find({ batchId: params.id })
      .sort({ createdAt: -1 })
      .lean();

    const studentCount = batch.students?.length || 0;

    // Enrich assignments with stats
    const enriched = await Promise.all(
      assignments.map(async (assign) => {
        const questionCount = assign.questions?.length || 0;
        const totalExpectedSubmissions = studentCount * questionCount;

        const completedSubmissions = await Submission.countDocuments({
          assignmentId: assign._id,
          status: { $in: ['COMPLETED', 'LATE'] },
        });

        // For student, also check student's own completion count
        let myCompleted = 0;
        if (currentUser.role === 'STUDENT') {
          myCompleted = await Submission.countDocuments({
            assignmentId: assign._id,
            studentId: currentUser._id,
            status: { $in: ['COMPLETED', 'LATE'] },
          });
        }

        const isExpired = new Date() > new Date(assign.deadline);

        return {
          ...assign,
          questionCount,
          studentCount,
          totalCompleted: completedSubmissions,
          myCompleted,
          isExpired,
          progressPercentage: questionCount > 0 ? Math.round((myCompleted / questionCount) * 100) : 0,
        };
      })
    );

    return NextResponse.json({
      success: true,
      assignments: enriched,
    });
  } catch (error) {
    console.error('Get batch assignments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
