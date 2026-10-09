import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import { getUserFromRequest } from '@/lib/auth';
import { getOwnedBatchIds } from '@/lib/adminScope';

export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const batchIds = await getOwnedBatchIds(currentUser._id);
    const batches = await Batch.find({ _id: { $in: batchIds } })
      .select('name code students')
      .lean();
    const studentIds = [...new Set(batches.flatMap((batch) => batch.students.map((id) => id.toString())))];

    const students = await User.find({ _id: { $in: studentIds }, role: 'STUDENT' })
      .select('-password')
      .sort({ createdAt: -1 })
      .lean();

    const studentBatchMap = {};
    batches.forEach((b) => {
      (b.students || []).forEach((sId) => {
        const id = sId.toString();
        if (!studentBatchMap[id]) studentBatchMap[id] = [];
        studentBatchMap[id].push({ name: b.name, code: b.code });
      });
    });

    const enriched = students.map((s) => ({
      ...s,
      batches: studentBatchMap[s._id.toString()] || [],
    }));

    return NextResponse.json({
      success: true,
      students: enriched,
    });
  } catch (error) {
    console.error('Get admin students error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
