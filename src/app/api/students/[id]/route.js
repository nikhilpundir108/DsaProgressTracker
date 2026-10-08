import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import Assignment from '@/lib/models/Assignment';
import Submission from '@/lib/models/Submission';
import { getUserFromRequest } from '@/lib/auth';
import { getInstructorBatchMatch } from '@/lib/batchAccess';

export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const studentId = params.id;

    // Permissions: Student viewing own profile, or Instructor / Admin
    if (currentUser.role === 'STUDENT' && currentUser._id.toString() !== studentId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const student = await User.findOne({ _id: studentId, role: 'STUDENT' })
      .select('-password')
      .lean();

    if (!student) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    // Find all batches student is in
    const batches = await Batch.find({ students: studentId, isArchived: { $ne: true } })
      .populate('instructorId', 'name email instructorId department')
      .lean();

    const batchIds = batches.map((b) => b._id);

    // If instructor is requesting, ensure student is in at least one of their batches
    if (currentUser.role === 'INSTRUCTOR') {
      const instructorBatchIds = (await Batch.find(getInstructorBatchMatch(currentUser._id)).select('_id')).map((b) =>
        b._id.toString()
      );
      const hasCommonBatch = batchIds.some((bId) => instructorBatchIds.includes(bId.toString()));
      if (!hasCommonBatch) {
        return NextResponse.json({ error: 'This student is not in your batches' }, { status: 403 });
      }
    }

    // Find all assignments across student's batches
    const assignments = await Assignment.find({ batchId: { $in: batchIds } })
      .populate('batchId', 'name code')
      .sort({ createdAt: -1 })
      .lean();

    const allSubmissions = await Submission.find({
      studentId,
      assignmentId: { $in: assignments.map((a) => a._id) },
    }).lean();

    const subMap = {}; // assignmentId -> { slug -> submission }
    allSubmissions.forEach((s) => {
      const aId = s.assignmentId.toString();
      if (!subMap[aId]) subMap[aId] = {};
      subMap[aId][s.questionSlug] = s;
    });

    let totalAssignedQuestions = 0;
    let totalCompletedQuestions = 0;

    const assignmentBreakdown = assignments.map((assign) => {
      const aId = assign._id.toString();
      const aSubs = subMap[aId] || {};
      const totalQ = assign.questions?.length || 0;
      totalAssignedQuestions += totalQ;

      let completedQ = 0;
      assign.questions.forEach((q) => {
        const sub = aSubs[q.slug];
        if (sub && (sub.status === 'COMPLETED' || sub.status === 'LATE')) {
          completedQ++;
        }
      });
      totalCompletedQuestions += completedQ;

      return {
        _id: assign._id,
        title: assign.title,
        batchName: assign.batchId?.name,
        batchCode: assign.batchId?.code,
        deadline: assign.deadline,
        totalQuestions: totalQ,
        completedQuestions: completedQ,
        progressPercentage: totalQ > 0 ? Math.round((completedQ / totalQ) * 100) : 0,
      };
    });

    const pendingQuestions = Math.max(0, totalAssignedQuestions - totalCompletedQuestions);
    const overallProgress =
      totalAssignedQuestions > 0 ? Math.round((totalCompletedQuestions / totalAssignedQuestions) * 100) : 0;

    return NextResponse.json({
      success: true,
      student,
      batches,
      analytics: {
        totalAssignedQuestions,
        totalCompletedQuestions,
        pendingQuestions,
        overallProgress,
        assignmentBreakdown,
        recentSubmissions: allSubmissions.slice(0, 10),
      },
    });
  } catch (error) {
    console.error('Get student analytics error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
