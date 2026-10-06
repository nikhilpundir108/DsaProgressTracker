import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Assignment from '@/lib/models/Assignment';
import Batch from '@/lib/models/Batch';
import Submission from '@/lib/models/Submission';
import { getUserFromRequest } from '@/lib/auth';

// Helper to extract clean slug from LeetCode / GFG url or title
function extractSlug(title, url, platform) {
  if (url) {
    try {
      const parsed = new URL(url);
      const pathname = parsed.pathname.replace(/\/+$/, '');
      const parts = pathname.split('/').filter(Boolean);
      if (platform === 'LEETCODE' && parts.includes('problems')) {
        const idx = parts.indexOf('problems');
        if (parts[idx + 1]) return parts[idx + 1].toLowerCase();
      }
      if (platform === 'GFG' && parts.includes('problems')) {
        const idx = parts.indexOf('problems');
        if (parts[idx + 1]) return parts[idx + 1].toLowerCase();
      }
      if (parts.length > 0) return parts[parts.length - 1].toLowerCase();
    } catch (e) {
      // URL parsing fallback
    }
  }
  return (title || 'question')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

// GET all assignments
export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let filter = {};

    if (currentUser.role === 'INSTRUCTOR') {
      filter.instructorId = currentUser._id;
    } else if (currentUser.role === 'STUDENT') {
      // Find batches student is enrolled in
      const batches = await Batch.find({ students: currentUser._id, isArchived: { $ne: true } }).select('_id');
      const batchIds = batches.map((b) => b._id);
      filter.batchId = { $in: batchIds };
    }

    const assignments = await Assignment.find(filter)
      .populate('batchId', 'name code branch section academicYear')
      .populate('instructorId', 'name email instructorId')
      .sort({ createdAt: -1 })
      .lean();

    // Enrich with completion info
    const enriched = await Promise.all(
      assignments.map(async (assign) => {
        const questionCount = assign.questions?.length || 0;
        let completedCount = 0;

        if (currentUser.role === 'STUDENT') {
          completedCount = await Submission.countDocuments({
            assignmentId: assign._id,
            studentId: currentUser._id,
            status: { $in: ['COMPLETED', 'LATE'] },
          });
        } else {
          // For instructor, total distinct completed questions by students
          completedCount = await Submission.countDocuments({
            assignmentId: assign._id,
            status: { $in: ['COMPLETED', 'LATE'] },
          });
        }

        const progressPercentage = questionCount > 0 ? Math.round((completedCount / questionCount) * 100) : 0;
        const isExpired = new Date() > new Date(assign.deadline);

        return {
          ...assign,
          questionCount,
          completedCount,
          progressPercentage,
          isExpired,
        };
      })
    );

    return NextResponse.json({
      success: true,
      assignments: enriched,
    });
  } catch (error) {
    console.error('Get assignments error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// POST create new assignment (Instructor)
export async function POST(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || (currentUser.role !== 'INSTRUCTOR' && currentUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Only instructors can create assignments' }, { status: 403 });
    }

    const { title, description, batchId, deadline, questions } = await req.json();

    if (!title || !batchId || !deadline) {
      return NextResponse.json({ error: 'Title, Batch, and Deadline are required' }, { status: 400 });
    }

    if (!questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'At least one question is required' }, { status: 400 });
    }

    const batch = await Batch.findById(batchId);
    if (!batch) {
      return NextResponse.json({ error: 'Batch not found' }, { status: 404 });
    }

    if (currentUser.role === 'INSTRUCTOR' && batch.instructorId.toString() !== currentUser._id.toString()) {
      return NextResponse.json({ error: 'You can only assign to your own batches' }, { status: 403 });
    }

    // Format and sanitize questions
    const formattedQuestions = questions.map((q) => {
      const platform = (q.platform || 'LEETCODE').toUpperCase();
      const slug = q.slug?.trim() || extractSlug(q.title, q.url, platform);
      return {
        title: q.title?.trim() || 'DSA Question',
        platform: platform === 'GFG' ? 'GFG' : 'LEETCODE',
        url: q.url?.trim() || (platform === 'GFG' ? `https://practice.geeksforgeeks.org/problems/${slug}` : `https://leetcode.com/problems/${slug}/`),
        slug,
        difficulty: q.difficulty || 'Easy',
        topic: q.topic?.trim() || 'General',
      };
    });

    const assignment = await Assignment.create({
      title: title.trim(),
      description: description?.trim() || '',
      batchId: batch._id,
      instructorId: currentUser._id,
      deadline: new Date(deadline),
      questions: formattedQuestions,
    });

    // Populate batch and instructor
    const populated = await Assignment.findById(assignment._id)
      .populate('batchId', 'name code branch section academicYear')
      .populate('instructorId', 'name email instructorId')
      .lean();

    return NextResponse.json({
      success: true,
      message: 'Assignment created and assigned to entire batch successfully',
      assignment: populated,
    });
  } catch (error) {
    console.error('Create assignment error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
