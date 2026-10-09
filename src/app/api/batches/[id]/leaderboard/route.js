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

    const batch = await Batch.findById(params.id).populate('students').lean();
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && !isBatchInstructor(batch, currentUser._id)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (currentUser.role === 'SUPER_ADMIN' && !(await isOwnedBatch(currentUser._id, batch._id))) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }
    if (currentUser.role === 'STUDENT' && !batch.students.some((id) => id._id.toString() === currentUser._id.toString())) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const assignments = await Assignment.find({ batchId: params.id }).lean();
    const totalQuestions = assignments.reduce((acc, a) => acc + (a.questions?.length || 0), 0);
    const students = batch.students || [];

    const leaderboard = await Promise.all(
      students.map(async (student) => {
        const completedCount = await Submission.countDocuments({
          studentId: student._id,
          assignmentId: { $in: assignments.map((a) => a._id) },
          status: { $in: ['COMPLETED', 'LATE'] },
        });

        const lcSolved = student.leetcodeStats?.totalSolved || 0;
        const gfgSolved = student.gfgStats?.totalSolved || 0;
        const totalSolved = lcSolved + gfgSolved;
        const assignmentPercentage = totalQuestions > 0 ? Math.round((completedCount / totalQuestions) * 100) : 0;

        // Simple score metric = (Assignment % * 10) + Total Solved
        const totalScore = assignmentPercentage * 10 + totalSolved;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          collegeRollNo: student.collegeRollNo || '—',
          branch: student.branch || batch.branch,
          leetcodeSolved: lcSolved,
          gfgSolved: gfgSolved,
          totalSolved,
          completedAssignments: completedCount,
          totalQuestions,
          assignmentPercentage,
          totalScore,
          isCurrentUser: currentUser._id.toString() === student._id.toString(),
        };
      })
    );

    // Sort by assignmentPercentage descending, then totalSolved descending
    leaderboard.sort((a, b) => {
      if (b.assignmentPercentage !== a.assignmentPercentage) {
        return b.assignmentPercentage - a.assignmentPercentage;
      }
      return b.totalSolved - a.totalSolved;
    });

    // Add rank
    const ranked = leaderboard.map((item, index) => ({
      rank: index + 1,
      ...item,
    }));

    return NextResponse.json({
      success: true,
      batch: {
        _id: batch._id,
        name: batch.name,
        code: batch.code,
        studentCount: students.length,
      },
      leaderboard: ranked,
    });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
