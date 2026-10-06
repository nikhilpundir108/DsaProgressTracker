import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import User from '@/lib/models/User';
import Assignment from '@/lib/models/Assignment';
import Submission from '@/lib/models/Submission';
import { getUserFromRequest } from '@/lib/auth';

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

    // Role check
    if (currentUser.role === 'INSTRUCTOR' && batch.instructorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get all assignments for this batch
    const assignments = await Assignment.find({ batchId: params.id }).lean();
    const totalAssignments = assignments.length;
    let totalQuestionsAssigned = 0;
    assignments.forEach((a) => {
      totalQuestionsAssigned += a.questions?.length || 0;
    });

    const students = batch.students || [];

    // For every student, calculate their metrics
    const studentMetrics = await Promise.all(
      students.map(async (student) => {
        const completedSubmissions = await Submission.countDocuments({
          studentId: student._id,
          assignmentId: { $in: assignments.map((a) => a._id) },
          status: { $in: ['COMPLETED', 'LATE'] },
        });

        const pendingQuestions = Math.max(0, totalQuestionsAssigned - completedSubmissions);
        const progressPercentage =
          totalQuestionsAssigned > 0 ? Math.round((completedSubmissions / totalQuestionsAssigned) * 100) : 0;

        const lcSolved = student.leetcodeStats?.totalSolved || 0;
        const gfgSolved = student.gfgStats?.totalSolved || 0;
        const totalSolved = lcSolved + gfgSolved;

        return {
          _id: student._id,
          name: student.name,
          email: student.email,
          collegeRollNo: student.collegeRollNo || '—',
          branch: student.branch || batch.branch,
          section: student.section || batch.section,
          leetcodeHandle: student.leetcodeHandle,
          gfgHandle: student.gfgHandle,
          leetcodeSolved: lcSolved,
          gfgSolved: gfgSolved,
          totalSolved,
          assignedQuestions: totalQuestionsAssigned,
          completedQuestions: completedSubmissions,
          pendingQuestions,
          progressPercentage,
          leetcodeStats: student.leetcodeStats,
          gfgStats: student.gfgStats,
        };
      })
    );

    // Calculate overall batch progress
    const totalStudents = students.length;
    let overallBatchProgress = 0;
    if (totalStudents > 0 && totalQuestionsAssigned > 0) {
      const sumProgress = studentMetrics.reduce((acc, curr) => acc + curr.progressPercentage, 0);
      overallBatchProgress = Math.round(sumProgress / totalStudents);
    }

    return NextResponse.json({
      success: true,
      batch: {
        _id: batch._id,
        name: batch.name,
        code: batch.code,
        branch: batch.branch,
        section: batch.section,
        academicYear: batch.academicYear,
        totalStudents,
        totalAssignments,
        totalQuestions: totalQuestionsAssigned,
        overallBatchProgress,
      },
      students: studentMetrics,
    });
  } catch (error) {
    console.error('Get batch progress error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
