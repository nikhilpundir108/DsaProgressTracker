import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import Assignment from '@/lib/models/Assignment';
import { getUserFromRequest } from '@/lib/auth';
import { getOwnedInstructorIds } from '@/lib/adminScope';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access restricted to Super Admin only' }, { status: 403 });
    }

    const instructorIds = await getOwnedInstructorIds(currentUser._id);
    const batches = await Batch.find({
      isArchived: { $ne: true },
      $or: [{ instructorId: { $in: instructorIds } }, { instructorIds: { $in: instructorIds } }],
    })
      .select('_id students')
      .lean();
    const batchIds = batches.map((batch) => batch._id);
    const studentIds = [...new Set(batches.flatMap((batch) => batch.students.map((id) => id.toString())))];

    const [activeInstructors, inactiveInstructors, totalStudents, totalAssignments] = await Promise.all([
      User.countDocuments({ role: 'INSTRUCTOR', ownerSuperAdminId: currentUser._id, isActive: true }),
      User.countDocuments({ role: 'INSTRUCTOR', ownerSuperAdminId: currentUser._id, isActive: false }),
      User.countDocuments({ _id: { $in: studentIds }, role: 'STUDENT' }),
      Assignment.countDocuments({ batchId: { $in: batchIds } }),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalInstructors: instructorIds.length,
        activeInstructors,
        inactiveInstructors,
        totalBatches: batches.length,
        totalStudents,
        totalAssignments,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
