import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Batch from '@/lib/models/Batch';
import Assignment from '@/lib/models/Assignment';
import BatchJoinRequest from '@/lib/models/BatchJoinRequest';
import { getUserFromRequest, generateBatchCode } from '@/lib/auth';
import { getInstructorBatchMatch } from '@/lib/batchAccess';

// GET batches based on user role
export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let filter = { isArchived: { $ne: true } };

    if (currentUser.role === 'INSTRUCTOR') {
      filter.$or = getInstructorBatchMatch(currentUser._id).$or;
    } else if (currentUser.role === 'STUDENT') {
      filter.students = currentUser._id;
    } else if (currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const batches = await Batch.find(filter)
      .populate('instructorId', 'name email instructorId department')
      .sort({ createdAt: -1 })
      .lean();

    // Attach counts: assignments count, pending join requests count
    const batchIds = batches.map((b) => b._id);
    const [assignments, requests] = await Promise.all([
      Assignment.find({ batchId: { $in: batchIds } }).select('batchId questions').lean(),
      BatchJoinRequest.find({ batchId: { $in: batchIds }, status: 'PENDING' }).select('batchId').lean(),
    ]);

    const assignmentCountMap = {};
    const questionCountMap = {};
    assignments.forEach((a) => {
      const bId = a.batchId.toString();
      assignmentCountMap[bId] = (assignmentCountMap[bId] || 0) + 1;
      questionCountMap[bId] = (questionCountMap[bId] || 0) + (a.questions?.length || 0);
    });

    const pendingRequestsMap = {};
    requests.forEach((r) => {
      const bId = r.batchId.toString();
      pendingRequestsMap[bId] = (pendingRequestsMap[bId] || 0) + 1;
    });

    const enrichedBatches = batches.map((batch) => ({
      ...batch,
      studentCount: batch.students?.length || 0,
      assignmentCount: assignmentCountMap[batch._id.toString()] || 0,
      questionCount: questionCountMap[batch._id.toString()] || 0,
      pendingRequestsCount: pendingRequestsMap[batch._id.toString()] || 0,
    }));

    return NextResponse.json({
      success: true,
      batches: enrichedBatches,
    });
  } catch (error) {
    console.error('Get batches error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new batch (Only Instructor)
export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Only instructors can create batches' }, { status: 403 });
    }

    const { name, branch, section, academicYear, description } = await req.json();

    if (!name || !branch || !section || !academicYear) {
      return NextResponse.json(
        { error: 'Batch Name, Branch, Section, and Academic Year are required' },
        { status: 400 }
      );
    }

    // Generate unique batch code
    let baseCode = generateBatchCode(branch, section, academicYear);
    let code = baseCode;
    let counter = 1;

    while (await Batch.findOne({ code })) {
      code = `${baseCode}-${counter}`;
      counter++;
    }

    const newBatch = await Batch.create({
      name: name.trim(),
      code,
      branch: branch.trim().toUpperCase(),
      section: section.trim().toUpperCase(),
      academicYear: String(academicYear).trim(),
      description: description?.trim() || '',
      instructorId: currentUser._id,
      instructorIds: [currentUser._id],
      students: [],
    });

    const populated = await Batch.findById(newBatch._id)
      .populate('instructorId', 'name email instructorId department')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Batch created successfully',
      batch: populated,
    });
  } catch (error) {
    console.error('Create batch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
