import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/lib/models/User';
import Batch from '@/lib/models/Batch';
import Assignment from '@/lib/models/Assignment';
import { getUserFromRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req) {
  try {
    await dbConnect();
    const currentUser = await getUserFromRequest(req);

    if (!currentUser || currentUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Access restricted to Super Admin only' }, { status: 403 });
    }

    const [totalInstructors, activeInstructors, inactiveInstructors, totalBatches, totalStudents, totalAssignments] =
      await Promise.all([
        User.countDocuments({ role: 'INSTRUCTOR' }),
        User.countDocuments({ role: 'INSTRUCTOR', isActive: true }),
        User.countDocuments({ role: 'INSTRUCTOR', isActive: false }),
        Batch.countDocuments({ isArchived: { $ne: true } }),
        User.countDocuments({ role: 'STUDENT' }),
        Assignment.countDocuments({}),
      ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalInstructors,
        activeInstructors,
        inactiveInstructors,
        totalBatches,
        totalStudents,
        totalAssignments,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
