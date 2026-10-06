import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Assignment from '@/lib/models/Assignment';
import Batch from '@/lib/models/Batch';
import Submission from '@/lib/models/Submission';
import User from '@/lib/models/User';
import { getUserFromRequest } from '@/lib/auth';

// GET assignment details
export async function GET(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const assignment = await Assignment.findById(params.id)
      .populate('batchId', 'name code branch section academicYear students')
      .populate('instructorId', 'name email instructorId department')
      .lean();

    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    const isExpired = new Date() > new Date(assignment.deadline);

    // If Student: fetch student's submissions for this assignment's questions
    if (currentUser.role === 'STUDENT') {
      const submissions = await Submission.find({
        assignmentId: assignment._id,
        studentId: currentUser._id,
      }).lean();

      const subMap = {};
      submissions.forEach((s) => {
        subMap[s.questionSlug] = s;
      });

      let completedCount = 0;
      const questionsWithStatus = assignment.questions.map((q) => {
        const sub = subMap[q.slug];
        const status = sub?.status || 'PENDING';
        if (status === 'COMPLETED' || status === 'LATE') completedCount++;

        return {
          ...q,
          status,
          solvedAt: sub?.solvedAt || null,
        };
      });

      return NextResponse.json({
        success: true,
        assignment: {
          ...assignment,
          questions: questionsWithStatus,
          totalQuestions: assignment.questions.length,
          completedQuestions: completedCount,
          progressPercentage:
            assignment.questions.length > 0 ? Math.round((completedCount / assignment.questions.length) * 100) : 0,
          isExpired,
        },
      });
    }

    // If Instructor / Admin: fetch student breakdown for this assignment
    const batchStudentIds = assignment.batchId?.students || [];
    const students = await User.find({ _id: { $in: batchStudentIds } })
      .select('name email collegeRollNo branch section leetcodeHandle gfgHandle')
      .lean();

    const allSubmissions = await Submission.find({ assignmentId: assignment._id }).lean();

    // Map: studentId -> { questionSlug -> status }
    const studentSubMap = {};
    allSubmissions.forEach((s) => {
      const sId = s.studentId.toString();
      if (!studentSubMap[sId]) studentSubMap[sId] = {};
      studentSubMap[sId][s.questionSlug] = s;
    });

    const studentBreakdown = students.map((stu) => {
      const stuSub = studentSubMap[stu._id.toString()] || {};
      let completed = 0;
      assignment.questions.forEach((q) => {
        const sub = stuSub[q.slug];
        if (sub && (sub.status === 'COMPLETED' || sub.status === 'LATE')) {
          completed++;
        }
      });

      const totalQ = assignment.questions.length;
      return {
        _id: stu._id,
        name: stu.name,
        email: stu.email,
        collegeRollNo: stu.collegeRollNo || '—',
        completedQuestions: completed,
        totalQuestions: totalQ,
        progressPercentage: totalQ > 0 ? Math.round((completed / totalQ) * 100) : 0,
        submissions: stuSub,
      };
    });

    return NextResponse.json({
      success: true,
      assignment: {
        ...assignment,
        totalQuestions: assignment.questions.length,
        isExpired,
      },
      studentBreakdown,
    });
  } catch (error) {
    console.error('Get assignment detail error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// PUT update assignment
export async function PUT(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const assignment = await Assignment.findById(params.id);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && assignment.instructorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const body = await req.json();
    if (body.title) assignment.title = body.title.trim();
    if (body.description !== undefined) assignment.description = body.description.trim();
    if (body.deadline) assignment.deadline = new Date(body.deadline);
    if (body.questions && Array.isArray(body.questions)) {
      assignment.questions = body.questions;
    }

    await assignment.save();

    return NextResponse.json({
      success: true,
      message: 'Assignment updated successfully',
      assignment,
    });
  } catch (error) {
    console.error('Update assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// DELETE assignment
export async function DELETE(req, { params }) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const assignment = await Assignment.findById(params.id);
    if (!assignment) {
      return NextResponse.json({ error: 'Assignment not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && assignment.instructorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    await Promise.all([
      Assignment.findByIdAndDelete(params.id),
      Submission.deleteMany({ assignmentId: params.id }),
    ]);

    return NextResponse.json({
      success: true,
      message: 'Assignment deleted successfully',
    });
  } catch (error) {
    console.error('Delete assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
